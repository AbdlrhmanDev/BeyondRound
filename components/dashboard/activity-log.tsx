'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface Activity {
  id: number;
  timestamp: string;
  activity: string;
  ip_address: string;
}

export function ActivityLog() {
  const [isOpen, setIsOpen] = useState(false);
  const [activityLog, setActivityLog] = useState<Activity[]>([]);

  const fetchActivityLog = async () => {
    try {
      const response = await fetch('/api/v1/activity-log');
      if (!response.ok) {
        throw new Error('Failed to fetch activity log');
      }
      const data = await response.json();
      setActivityLog(data);
    } catch (error: unknown) {
      console.error(error);
      toast.error('Failed to fetch activity log.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={fetchActivityLog}>
          View Log
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Activity Log</DialogTitle>
          <DialogDescription>
            A history of your account activity.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-96 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activityLog.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    {new Date(activity.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>{activity.activity}</TableCell>
                  <TableCell>{activity.ip_address}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
