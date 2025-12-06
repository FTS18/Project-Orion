import React from 'react';
import RulesEditor from '../components/rules-editor';
import { SpotlightCard } from '../components/ui/spotlight-card';
import { CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage business rules, view analytics, and configure system settings.
          </p>
        </div>

        <Tabs defaultValue="rules" className="space-y-4">
          <TabsList>
            <TabsTrigger value="rules">Business Rules</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="space-y-4">
            <RulesEditor />
          </TabsContent>

          <TabsContent value="analytics">
            <SpotlightCard spotlightColor="rgba(var(--primary), 0.1)">
              <CardHeader>
                <CardTitle>System Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground">Analytics Dashboard Coming Soon</p>
                </div>
              </CardContent>
            </SpotlightCard>
          </TabsContent>

          <TabsContent value="settings">
            <SpotlightCard spotlightColor="rgba(var(--primary), 0.1)">
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground">Settings Panel Coming Soon</p>
                </div>
              </CardContent>
            </SpotlightCard>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
