'use client';

import ClientFormModal from '@/components/ClientFormModal';

export default function NewClientPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">New Client Intake</h1>
      <ClientFormModal isOpen={true} onClose={() => {}} />
    </div>
  );
}
