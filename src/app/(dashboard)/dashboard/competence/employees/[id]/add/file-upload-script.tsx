'use client'

import { useEffect } from 'react'

export function FileUploadScript() {
  useEffect(() => {
    const fileInput = document.getElementById('certificateFile') as HTMLInputElement
    const selectedFileDiv = document.getElementById('selected-file')
    const uploadStatusDiv = document.getElementById('upload-status')
    const form = document.getElementById('competence-form') as HTMLFormElement
    const submitButton = document.getElementById('submit-button') as HTMLButtonElement
    
    if (!fileInput || !selectedFileDiv || !uploadStatusDiv || !form || !submitButton) return
    
    // Sjekk om det finnes en feilmelding i URL-en ved lasting
    const checkUrlParams = () => {
      const urlParams = new URLSearchParams(window.location.search)
      const errorMessage = urlParams.get('error')
      
      if (errorMessage) {
        uploadStatusDiv.textContent = `Feil: ${decodeURIComponent(errorMessage)}`
        uploadStatusDiv.classList.remove('hidden')
        uploadStatusDiv.classList.remove('text-blue-600')
        uploadStatusDiv.classList.remove('text-green-600')
        uploadStatusDiv.classList.add('text-red-600')
      }
    }
    
    // Kjør sjekk ved første lasting
    checkUrlParams()
    
    const handleFileChange = () => {
      if (fileInput.files && fileInput.files.length > 0) {
        const fileName = fileInput.files[0].name
        selectedFileDiv.textContent = `Valgt fil: ${fileName}`
        selectedFileDiv.classList.remove('hidden')
        
        // Skjul statusmeldingen når en ny fil velges
        uploadStatusDiv.textContent = ''
        uploadStatusDiv.classList.add('hidden')
        
        // Sjekk filstørrelsen (maks 5MB)
        const fileSize = fileInput.files[0].size
        const maxSize = 5 * 1024 * 1024 // 5MB
        
        if (fileSize > maxSize) {
          uploadStatusDiv.textContent = 'Filen er for stor. Maksimal størrelse er 5MB.'
          uploadStatusDiv.classList.remove('hidden')
          uploadStatusDiv.classList.remove('text-blue-600')
          uploadStatusDiv.classList.remove('text-green-600')
          uploadStatusDiv.classList.add('text-red-600')
          
          // Tøm filvalget
          fileInput.value = ''
          selectedFileDiv.textContent = ''
          selectedFileDiv.classList.add('hidden')
          return
        }
      } else {
        selectedFileDiv.textContent = ''
        selectedFileDiv.classList.add('hidden')
      }
    }
    
    const handleSubmit = (e: Event) => {
      // Bare vis lasteindikatoren hvis en fil er valgt
      if (fileInput.files && fileInput.files.length > 0) {
        // Lagre original knappetekst
        const originalText = submitButton.innerHTML
        
        // Vis lasteindikatoren
        submitButton.disabled = true
        submitButton.innerHTML = `
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Laster opp...
        `
        
        // Vis opplastingsstatus
        uploadStatusDiv.textContent = 'Laster opp fil...'
        uploadStatusDiv.classList.remove('hidden')
        uploadStatusDiv.classList.remove('text-green-600')
        uploadStatusDiv.classList.remove('text-red-600')
        uploadStatusDiv.classList.add('text-blue-600')
        
        // Gjenopprett knappen hvis det oppstår en feil
        const resetButton = () => {
          submitButton.disabled = false
          submitButton.innerHTML = originalText
        }
        
        // Sett en timeout for å gjenopprette knappen hvis opplastingen tar for lang tid
        const timeout = setTimeout(() => {
          resetButton()
          uploadStatusDiv.textContent = 'Opplastingen tok for lang tid. Prøv igjen.'
          uploadStatusDiv.classList.remove('text-blue-600')
          uploadStatusDiv.classList.add('text-red-600')
        }, 30000) // 30 sekunder timeout
        
        // Lytt etter fullføring av skjemainnlevering
        window.addEventListener('load', () => {
          clearTimeout(timeout)
          resetButton()
          
          // Sjekk om det finnes en feilmelding i URL-en
          checkUrlParams()
        }, { once: true })
      }
    }
    
    fileInput.addEventListener('change', handleFileChange)
    form.addEventListener('submit', handleSubmit)
    
    // Cleanup
    return () => {
      fileInput.removeEventListener('change', handleFileChange)
      form.removeEventListener('submit', handleSubmit)
    }
  }, [])
  
  return null
} 