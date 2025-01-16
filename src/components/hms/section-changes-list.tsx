"use client"

interface Measure {
  id: string
  description: string
  type: string
  status: string
}

interface Deviation {
  id: string
  title: string
  description: string
  measures: Measure[]
}

interface DeviationRelation {
  deviation: Deviation
}

interface HMSChange {
  id: string
  title: string
  description: string
  changeType: string
  status: string
  measures: Measure[]
  deviations: DeviationRelation[]
}

interface Props {
  changes: HMSChange[]
}

export function SectionChangesList({ changes = [] }: Props) {
  if (!changes) return null

  return (
    <div className="space-y-4">
      {changes.map(change => (
        <div 
          key={change.id}
          className={`p-4 border rounded-lg ${
            change.status === "PLANNED" ? "border-yellow-500" : "border-green-500"
          }`}
        >
          <div className="flex justify-between items-start">
            <h4 className="font-medium">{change.title}</h4>
            <span className="text-sm px-2 py-1 rounded-full bg-muted">
              {change.status === "PLANNED" ? "Ventende" : "Under arbeid"}
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground mt-1">
            {change.description}
          </p>

          {/* Vis tilknyttede avvik og deres tiltak */}
          {change.deviations?.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium">Fra avvik:</p>
              <ul className="list-disc list-inside text-sm space-y-2">
                {change.deviations.map(({ deviation }) => (
                  <li key={deviation.id}>
                    <span>{deviation.title}</span>
                    {deviation.measures?.length > 0 && (
                      <ul className="ml-4 list-circle list-inside text-sm mt-1">
                        {deviation.measures.map(measure => (
                          <li key={measure.id} className="text-muted-foreground">
                            {measure.description}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Vis HMS-endringens egne tiltak */}
          {change.measures?.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium">HMS-tiltak:</p>
              <ul className="list-disc list-inside text-sm">
                {change.measures.map(measure => (
                  <li key={measure.id}>{measure.description}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  )
} 