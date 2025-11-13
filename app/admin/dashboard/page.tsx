import { redirect } from 'next/navigation';

// Redirect to main admin page
// This page exists for routing consistency
export default function AdminDashboardPage() {
  redirect('/admin');
}

