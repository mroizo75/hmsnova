async function createTestDeviation() {
  const testData = {
    title: "Test avvik",
    description: "Dette er en test beskrivelse",
    type: "NEAR_MISS",
    category: "HMS",
    severity: "LOW",
    status: "OPEN",
    location: "Test lokasjon"
  }

  try {
    const response = await fetch('/api/deviations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Error creating deviation:', error)
      throw new Error(error.message)
    }

    const data = await response.json()
    console.log('Deviation created:', data)
    return data
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
} 