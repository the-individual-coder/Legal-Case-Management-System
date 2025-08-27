'use client';

import React from 'react';

type ClientFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const ClientFormModal: React.FC<ClientFormModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <h1 className='text-red-100'>asdasd</h1>
      <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Client Intake Form</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-black">✕</button>
        </div>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input type="text" className="w-full border rounded px-3 py-2" placeholder="Enter full name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" className="w-full border rounded px-3 py-2" placeholder="Enter email" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input type="tel" className="w-full border rounded px-3 py-2" placeholder="Enter phone number" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <textarea className="w-full border rounded px-3 py-2" placeholder="Enter address" />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded text-sm">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded text-sm">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientFormModal;
