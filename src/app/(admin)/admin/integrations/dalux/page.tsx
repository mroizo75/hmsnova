'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Loader2, RefreshCw, Check, AlertTriangle, Info } from 'lucide-react';
import AdminLayout from '@/components/layouts/AdminLayout';

// Types
interface DaluxProject {
  id: string;
  name: string;
  description?: string;
  status: string;
}

interface SyncedResource {
  id: string;
  sourceId: string;
  sourceType: string;
  targetId: string;
  projectId: string;
  status: string;
  lastSync: string;
  error?: string;
}

export default function DaluxIntegrationPage() {
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [projects, setProjects] = useState<DaluxProject[]>([]);
  const [syncedResources, setSyncedResources] = useState<SyncedResource[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingSyncedResources, setIsLoadingSyncedResources] = useState(false);
  const [isSyncingDeviations, setIsSyncingDeviations] = useState(false);
  const [isSyncingSJAs, setIsSyncingSJAs] = useState(false);

  // Hent prosjekter
  const fetchProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const response = await fetch('/api/integrations/dalux?action=projects');
      if (!response.ok) {
        throw new Error('Kunne ikke hente prosjekter fra Dalux');
      }
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      toast({
        title: 'Feil ved henting av prosjekter',
        description: error instanceof Error ? error.message : 'Ukjent feil',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingProjects(false);
    }
  };

  // Hent synkroniserte ressurser
  const fetchSyncedResources = async () => {
    setIsLoadingSyncedResources(true);
    try {
      const response = await fetch('/api/integrations/dalux?action=all_synced');
      if (!response.ok) {
        throw new Error('Kunne ikke hente synkroniserte ressurser');
      }
      const data = await response.json();
      setSyncedResources(data.syncedResources || []);
    } catch (error) {
      toast({
        title: 'Feil ved henting av synkroniserte ressurser',
        description: error instanceof Error ? error.message : 'Ukjent feil',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingSyncedResources(false);
    }
  };

  // Synkroniser alle avvik
  const syncAllDeviations = async (status?: string) => {
    if (!selectedProject) {
      toast({
        title: 'Velg prosjekt',
        description: 'Du må velge et prosjekt før du kan synkronisere',
        variant: 'destructive',
      });
      return;
    }

    setIsSyncingDeviations(true);
    try {
      const response = await fetch('/api/integrations/dalux', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sync_all_deviations',
          projectId: selectedProject,
          status,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Kunne ikke synkronisere avvik');
      }

      const data = await response.json();
      toast({
        title: 'Synkronisering startet',
        description: `Synkronisering av ${data.result?.total || 0} avvik er startet.`,
      });

      // Oppdater synkroniseringsstatus etter en kort forsinkelse
      setTimeout(fetchSyncedResources, 2000);
    } catch (error) {
      toast({
        title: 'Synkronisering feilet',
        description: error instanceof Error ? error.message : 'Ukjent feil',
        variant: 'destructive',
      });
    } finally {
      setIsSyncingDeviations(false);
    }
  };

  // Synkroniser alle SJA-er
  const syncAllSJAs = async (status?: string) => {
    if (!selectedProject) {
      toast({
        title: 'Velg prosjekt',
        description: 'Du må velge et prosjekt før du kan synkronisere',
        variant: 'destructive',
      });
      return;
    }

    setIsSyncingSJAs(true);
    try {
      const response = await fetch('/api/integrations/dalux', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sync_all_sjas',
          projectId: selectedProject,
          status,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Kunne ikke synkronisere SJA-er');
      }

      const data = await response.json();
      toast({
        title: 'Synkronisering startet',
        description: `Synkronisering av ${data.result?.total || 0} SJA-er er startet.`,
      });

      // Oppdater synkroniseringsstatus etter en kort forsinkelse
      setTimeout(fetchSyncedResources, 2000);
    } catch (error) {
      toast({
        title: 'Synkronisering feilet',
        description: error instanceof Error ? error.message : 'Ukjent feil',
        variant: 'destructive',
      });
    } finally {
      setIsSyncingSJAs(false);
    }
  };

  // Last inn data ved oppstart
  useEffect(() => {
    fetchProjects();
    fetchSyncedResources();

    // Sett opp intervall for å oppdatere synkroniseringsstatus
    const interval = setInterval(fetchSyncedResources, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Dalux Integrasjon</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Prosjektvalg</CardTitle>
            <CardDescription>
              Velg et Dalux-prosjekt for synkronisering av avvik og SJA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-1/3">
                <Select
                  value={selectedProject}
                  onValueChange={setSelectedProject}
                  disabled={isLoadingProjects}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Velg prosjekt" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingProjects ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Laster prosjekter...</span>
                      </div>
                    ) : (
                      projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                onClick={fetchProjects}
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Oppdater prosjektliste
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="sync">
          <TabsList>
            <TabsTrigger value="sync">Synkronisering</TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sync">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Avvikssynkronisering</CardTitle>
                  <CardDescription>
                    Synkroniser avvik til Dalux Field
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Button
                        onClick={() => syncAllDeviations()}
                        disabled={!selectedProject || isSyncingDeviations}
                        className="w-full"
                      >
                        {isSyncingDeviations ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Synkroniser alle åpne avvik
                      </Button>
                    </div>
                    
                    <div>
                      <Button
                        onClick={() => syncAllDeviations('CLOSED')}
                        disabled={!selectedProject || isSyncingDeviations}
                        variant="outline"
                        className="w-full"
                      >
                        {isSyncingDeviations ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Synkroniser lukkede avvik
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>SJA-synkronisering</CardTitle>
                  <CardDescription>
                    Synkroniser SJA til Dalux Field
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Button
                        onClick={() => syncAllSJAs()}
                        disabled={!selectedProject || isSyncingSJAs}
                        className="w-full"
                      >
                        {isSyncingSJAs ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Synkroniser alle aktive SJA-er
                      </Button>
                    </div>
                    
                    <div>
                      <Button
                        onClick={() => syncAllSJAs('COMPLETED')}
                        disabled={!selectedProject || isSyncingSJAs}
                        variant="outline"
                        className="w-full"
                      >
                        {isSyncingSJAs ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Synkroniser fullførte SJA-er
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="status">
            <Card>
              <CardHeader>
                <CardTitle>Synkroniseringsstatus</CardTitle>
                <CardDescription>
                  Oversikt over synkroniserte ressurser
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSyncedResources ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Laster synkroniseringsdata...</span>
                  </div>
                ) : syncedResources.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 px-4 text-left">Kilde ID</th>
                          <th className="py-2 px-4 text-left">Type</th>
                          <th className="py-2 px-4 text-left">Dalux ID</th>
                          <th className="py-2 px-4 text-left">Status</th>
                          <th className="py-2 px-4 text-left">Sist synkronisert</th>
                        </tr>
                      </thead>
                      <tbody>
                        {syncedResources.map((resource) => (
                          <tr key={resource.id} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-4">{resource.sourceId}</td>
                            <td className="py-2 px-4">
                              {resource.sourceType === 'deviation' ? 'Avvik' : 'SJA'}
                            </td>
                            <td className="py-2 px-4">{resource.targetId || '-'}</td>
                            <td className="py-2 px-4">
                              <Badge variant={
                                resource.status === 'success' ? 'success' : 
                                resource.status === 'error' ? 'destructive' : 
                                'outline'
                              }>
                                {resource.status === 'success' ? (
                                  <Check className="h-3 w-3 mr-1" />
                                ) : resource.status === 'error' ? (
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                ) : (
                                  <Info className="h-3 w-3 mr-1" />
                                )}
                                {resource.status === 'success' ? 'Synkronisert' : 
                                 resource.status === 'error' ? 'Feil' : 'Venter'}
                              </Badge>
                            </td>
                            <td className="py-2 px-4">
                              {new Date(resource.lastSync).toLocaleString('nb-NO')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center p-8 text-muted-foreground">
                    Ingen synkroniserte ressurser funnet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
} 