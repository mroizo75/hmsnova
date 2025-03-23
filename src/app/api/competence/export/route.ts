import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import ExcelJS from 'exceljs'
import { format } from 'date-fns'
import { nb } from 'date-fns/locale'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { message: "Ikke autorisert" },
        { status: 401 }
      )
    }
    
    // Hent data fra request
    const {
      employeeId,
      competenceTypeId,
      category,
      status,
      expiryStatus,
      search,
      groupByEmployee = false,
      columns = {
        name: true,
        email: true,
        department: true,
        position: true,
        competenceType: true,
        category: true,
        achievedDate: true,
        expiryDate: true,
        status: true
      }
    } = await req.json()
    
    // Bygg opp where-objektet basert på filtrene
    const where: any = {
      user: {
        companyId: session.user.companyId
      }
    }
    
    if (employeeId) {
      where.userId = employeeId
    }
    
    if (competenceTypeId) {
      where.competenceTypeId = competenceTypeId
    }
    
    if (status) {
      where.verificationStatus = status
    }
    
    if (category) {
      where.competenceType = {
        category
      }
    }
    
    if (expiryStatus) {
      const now = new Date()
      
      if (expiryStatus === 'expired') {
        where.expiryDate = {
          lt: now
        }
      } else if (expiryStatus === 'expiringSoon') {
        const threeMonthsFromNow = new Date(now)
        threeMonthsFromNow.setMonth(now.getMonth() + 3)
        
        where.expiryDate = {
          gte: now,
          lte: threeMonthsFromNow
        }
      } else if (expiryStatus === 'valid') {
        where.expiryDate = {
          gt: now
        }
      } else if (expiryStatus === 'noExpiry') {
        where.expiryDate = null
      }
    }
    
    // Hvis det er søk, filtrer på ansatt navn eller e-post
    if (search) {
      where.user = {
        ...where.user,
        OR: [
          { name: { contains: search } },
          { email: { contains: search } }
        ]
      }
    }
    
    // Hent kompetansedata
    const competencies = await prisma.competence.findMany({
      where,
      include: {
        user: true,
        competenceType: true
      },
      orderBy: groupByEmployee 
        ? [{ user: { name: 'asc' } }, { expiryDate: 'asc' }]
        : [{ expiryDate: 'asc' }]
    })
    
    // Beregn utløpsstatus for hver kompetanse
    const enhancedCompetencies = competencies.map(competence => {
      const now = new Date()
      let expiryStatusValue = 'Gyldig'
      
      if (!competence.expiryDate) {
        expiryStatusValue = 'Ingen utløpsdato'
      } else if (competence.expiryDate < now) {
        expiryStatusValue = 'Utløpt'
      } else {
        const threeMonthsFromNow = new Date(now)
        threeMonthsFromNow.setMonth(now.getMonth() + 3)
        
        if (competence.expiryDate < threeMonthsFromNow) {
          expiryStatusValue = 'Utløper snart'
        }
      }
      
      // Hent metadata som avdeling og stilling
      const userMetadata = competence.user.metadata as Record<string, any> || {}
      const department = userMetadata.department || 'Ikke angitt'
      const position = userMetadata.position || 'Ikke angitt'
      
      // Map status til lesbar tekst
      let statusText = 'Ukjent'
      if (competence.verificationStatus === 'VERIFIED') {
        statusText = 'Verifisert'
      } else if (competence.verificationStatus === 'PENDING') {
        statusText = 'Venter på godkjenning'
      } else if (competence.verificationStatus === 'REJECTED') {
        statusText = 'Avvist'
      }
      
      return {
        ...competence,
        expiryStatusValue,
        department,
        position,
        statusText
      }
    })
    
    // Opprett Excel-arbeidsbok
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'HMS Nova'
    workbook.created = new Date()
    
    // Hvis gruppert etter ansatt, organiser data forskjellig
    if (groupByEmployee) {
      // Grupper kompetanser etter ansatt
      const employeeMap = new Map()
      
      enhancedCompetencies.forEach(comp => {
        const userId = comp.user.id
        if (!employeeMap.has(userId)) {
          employeeMap.set(userId, {
            user: {
              id: comp.user.id,
              name: comp.user.name,
              email: comp.user.email,
              department: comp.department,
              position: comp.position
            },
            competencies: []
          })
        }
        
        employeeMap.get(userId).competencies.push({
          competenceType: comp.competenceType.name,
          category: comp.competenceType.category,
          achievedDate: comp.achievedDate,
          expiryDate: comp.expiryDate,
          status: comp.statusText,
          expiryStatus: comp.expiryStatusValue
        })
      })
      
      // Opprett et arbeidsark for hver ansatt
      const employeeGroups = Array.from(employeeMap.values())
      
      // Overskriftsark med sammendrag
      const summarySheet = workbook.addWorksheet('Oversikt')
      summarySheet.columns = [
        { header: 'Ansatt', key: 'name', width: 20 },
        { header: 'E-post', key: 'email', width: 30 },
        { header: 'Avdeling', key: 'department', width: 15 },
        { header: 'Stilling', key: 'position', width: 15 },
        { header: 'Antall kompetanser', key: 'total', width: 20 },
        { header: 'Verifiserte', key: 'verified', width: 15 },
        { header: 'Venter', key: 'pending', width: 15 },
        { header: 'Utløpt', key: 'expired', width: 15 },
        { header: 'Utløper snart', key: 'expiringSoon', width: 15 }
      ]
      
      // Format header på sammendragsarket
      summarySheet.getRow(1).font = { bold: true }
      summarySheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2C435F' }
      }
      summarySheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true }
      
      // Legg til sammendragsdata
      employeeGroups.forEach(group => {
        const verified = group.competencies.filter(c => c.status === 'Verifisert').length
        const pending = group.competencies.filter(c => c.status === 'Venter på godkjenning').length
        const expired = group.competencies.filter(c => c.expiryStatus === 'Utløpt').length
        const expiringSoon = group.competencies.filter(c => c.expiryStatus === 'Utløper snart').length
        
        summarySheet.addRow({
          name: group.user.name,
          email: group.user.email,
          department: group.user.department,
          position: group.user.position,
          total: group.competencies.length,
          verified,
          pending,
          expired,
          expiringSoon
        })
      })
      
      // Legg til autofilter for sammendragsark
      summarySheet.autoFilter = {
        from: 'A1',
        to: 'I' + (employeeGroups.length + 1)
      }
      
      // Lag et arbeidsark for hver ansatt med detaljert kompetanseinformasjon
      if (employeeGroups.length <= 20) { // Begrens til 20 ansatte for å unngå for mange arbeidsark
        employeeGroups.forEach(group => {
          const sheetName = (group.user.name || 'Ansatt').slice(0, 28) // Begrens til 28 tegn som er Excel-begrensning
          const sheet = workbook.addWorksheet(sheetName)
          
          // Lag kolonner for dette ansatt-arket
          const employeeColumns = []
          if (columns.competenceType) employeeColumns.push({ header: 'Kompetanse', key: 'competenceType', width: 20 })
          if (columns.category) employeeColumns.push({ header: 'Kategori', key: 'category', width: 15 })
          if (columns.achievedDate) employeeColumns.push({ header: 'Oppnådd dato', key: 'achievedDate', width: 15 })
          if (columns.expiryDate) employeeColumns.push({ header: 'Utløpsdato', key: 'expiryDate', width: 15 })
          if (columns.status) employeeColumns.push({ header: 'Status', key: 'status', width: 15 })
          if (columns.expiryStatus) employeeColumns.push({ header: 'Utløpsstatus', key: 'expiryStatus', width: 15 })
          
          sheet.columns = employeeColumns
          
          // Formater header
          sheet.getRow(1).font = { bold: true }
          sheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF2C435F' }
          }
          sheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true }
          
          // Legg til data i ansatt-arket
          group.competencies.forEach(comp => {
            const row: any = {}
            
            if (columns.competenceType) row.competenceType = comp.competenceType
            if (columns.category) row.category = comp.category
            if (columns.achievedDate) row.achievedDate = comp.achievedDate ? format(new Date(comp.achievedDate), 'dd.MM.yyyy', { locale: nb }) : ''
            if (columns.expiryDate) row.expiryDate = comp.expiryDate ? format(new Date(comp.expiryDate), 'dd.MM.yyyy', { locale: nb }) : 'Utløper ikke'
            if (columns.status) row.status = comp.status
            if (columns.expiryStatus) row.expiryStatus = comp.expiryStatus
            
            sheet.addRow(row)
          })
          
          // Legg til autofilter for ansatt-arket
          if (group.competencies.length > 0) {
            sheet.autoFilter = {
              from: 'A1',
              to: String.fromCharCode(64 + employeeColumns.length) + (group.competencies.length + 1)
            }
          }
        })
      }
    } else {
      // Standard flatt format uten gruppering
      const worksheet = workbook.addWorksheet('Kompetanseoversikt')
      
      // Definer kolonner basert på valgte visningskolonner
      const excelColumns = []
      
      if (columns.name) excelColumns.push({ header: 'Ansatt', key: 'name', width: 20 })
      if (columns.email) excelColumns.push({ header: 'E-post', key: 'email', width: 30 })
      if (columns.department) excelColumns.push({ header: 'Avdeling', key: 'department', width: 15 })
      if (columns.position) excelColumns.push({ header: 'Stilling', key: 'position', width: 15 })
      if (columns.competenceType) excelColumns.push({ header: 'Kompetansetype', key: 'competenceType', width: 20 })
      if (columns.category) excelColumns.push({ header: 'Kategori', key: 'category', width: 15 })
      if (columns.achievedDate) excelColumns.push({ header: 'Oppnådd dato', key: 'achievedDate', width: 15 })
      if (columns.expiryDate) excelColumns.push({ header: 'Utløpsdato', key: 'expiryDate', width: 15 })
      if (columns.status) excelColumns.push({ header: 'Status', key: 'status', width: 20 })
      if (columns.expiryStatus) excelColumns.push({ header: 'Utløpsstatus', key: 'expiryStatus', width: 15 })
      
      worksheet.columns = excelColumns
      
      // Legg til data i arbeidsarket
      const rows = enhancedCompetencies.map(comp => {
        const row: any = {}
        
        if (columns.name) row.name = comp.user.name
        if (columns.email) row.email = comp.user.email
        if (columns.department) row.department = comp.department
        if (columns.position) row.position = comp.position
        if (columns.competenceType) row.competenceType = comp.competenceType.name
        if (columns.category) row.category = comp.competenceType.category
        if (columns.achievedDate) row.achievedDate = comp.achievedDate ? format(new Date(comp.achievedDate), 'dd.MM.yyyy', { locale: nb }) : ''
        if (columns.expiryDate) row.expiryDate = comp.expiryDate ? format(new Date(comp.expiryDate), 'dd.MM.yyyy', { locale: nb }) : 'Utløper ikke'
        if (columns.status) row.status = comp.statusText
        if (columns.expiryStatus) row.expiryStatus = comp.expiryStatusValue
        
        return row
      })
      
      worksheet.addRows(rows)
      
      // Formater header
      worksheet.getRow(1).font = { bold: true }
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2C435F' }
      }
      worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true }
      
      // Legg til autofilter
      if (rows.length > 0) {
        worksheet.autoFilter = {
          from: 'A1',
          to: String.fromCharCode(64 + excelColumns.length) + (rows.length + 1)
        }
      }
    }
    
    // Generer buffer
    const buffer = await workbook.xlsx.writeBuffer()
    
    // Opprett filnavn
    const filename = `kompetanserapport-${format(new Date(), 'yyyy-MM-dd', { locale: nb })}.xlsx`
    
    // Returner Excel-filen
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    console.error("Feil ved eksport av kompetanserapport:", error)
    return NextResponse.json(
      { message: "Kunne ikke eksportere kompetanserapport" },
      { status: 500 }
    )
  }
} 