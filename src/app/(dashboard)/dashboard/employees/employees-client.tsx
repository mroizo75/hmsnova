const handleDelete = async (userId: string) => {
  try {
    const response = await fetch(`/api/employees/${userId}`, {
      method: 'DELETE'
    })

    const data = await response.json()

    if (!response.ok) {
      if (response.status === 400 && data.message.includes('egen brukerkonto')) {
        toast.error('Du kan ikke slette din egen brukerkonto. Kontakt en annen administrator.')
        return
      }
      if (response.status === 403) {
        toast.error('Du har ikke tilgang til å slette brukere')
        return
      }
      toast.error(data.message || 'Kunne ikke slette bruker')
      return
    }

    // Oppdater bruker-listen
    setUsers(users.filter(user => user.id !== userId))
    toast.success('Bruker slettet')
  } catch (error) {
    console.error('Error deleting user:', error)
    toast.error('Noe gikk galt ved sletting av bruker')
  }
} 