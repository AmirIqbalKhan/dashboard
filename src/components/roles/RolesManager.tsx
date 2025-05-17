"use client";

import React, { useEffect, useState } from 'react';
import { ClipLoader } from "react-spinners";
import { useTheme } from "@/app/theme-context";

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

export const RolesManager: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<{ name: string; description: string; permissionIds: string[] }>({ name: '', description: '', permissionIds: [] });
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const { brandColor } = useTheme();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [rolesRes, permissionsRes] = await Promise.all([
      fetch('/api/roles'),
      fetch('/api/permissions'),
    ]);
    setRoles(await rolesRes.json());
    setPermissions(await permissionsRes.json());
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePermissionToggle = (id: string) => {
    setForm((prev) => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(id)
        ? prev.permissionIds.filter((pid) => pid !== id)
        : [...prev.permissionIds, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRole) {
      await fetch(`/api/roles/${editingRole.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } else {
      await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    }
    setForm({ name: '', description: '', permissionIds: [] });
    setEditingRole(null);
    fetchData();
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setForm({
      name: role.name,
      description: role.description,
      permissionIds: role.permissions.map((p) => p.id),
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      await fetch(`/api/roles/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  // Group permissions by page
  const groupedPermissions = permissions.reduce((acc, perm) => {
    const match = perm.name.match(/^(view|manage)_(.+)$/);
    if (!match) return acc;
    const [, action, page] = match;
    if (!acc[page]) acc[page] = { view: undefined, manage: undefined };
    acc[page][action as 'view' | 'manage'] = perm;
    return acc;
  }, {} as Record<string, { view?: Permission; manage?: Permission }>);

  if (loading) return (
    <div className="flex justify-center items-center h-48">
      <ClipLoader color={brandColor} size={48} />
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSubmit} className="mb-8 p-8 bg-white/50 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30">
        <h2 className="text-xl font-semibold mb-4">{editingRole ? 'Edit Role' : 'Create Role'}</h2>
        <input
          name="name"
          value={form.name}
          onChange={handleInputChange}
          placeholder="Role name"
          className="block w-full mb-3 p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          required
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleInputChange}
          placeholder="Description"
          className="block w-full mb-3 p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
        <div className="mb-4">
          <div className="font-semibold mb-2">Permissions:</div>
          <div className="flex flex-col gap-2">
            {Object.entries(groupedPermissions).map(([page, actions]) => {
              const viewPermission = actions.view;
              const managePermission = actions.manage;
              return (
                <div key={page} className="flex items-center gap-4 bg-white/30 px-3 py-2 rounded-lg">
                  <span className="capitalize font-medium min-w-[120px]">{page.replace(/_/g, ' ')}</span>
                  {viewPermission && (
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={form.permissionIds.includes(viewPermission.id)}
                        onChange={() => handlePermissionToggle(viewPermission.id)}
                      />
                      <span className="text-sm">View</span>
                    </label>
                  )}
                  {managePermission && (
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={form.permissionIds.includes(managePermission.id)}
                        onChange={() => handlePermissionToggle(managePermission.id)}
                      />
                      <span className="text-sm">Manage</span>
                    </label>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-2 px-6 rounded-lg shadow-lg hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
        >
          {editingRole ? 'Update Role' : 'Create Role'}
        </button>
        {editingRole && (
          <button
            type="button"
            className="ml-4 text-gray-600 underline"
            onClick={() => {
              setEditingRole(null);
              setForm({ name: '', description: '', permissionIds: [] });
            }}
          >
            Cancel
          </button>
        )}
      </form>
      <div className="bg-white/50 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-8">
        <h2 className="text-xl font-semibold mb-4">Existing Roles</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white/40">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Name</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Description</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Permissions</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white/20 divide-y divide-gray-100">
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-white/40 transition-all duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{role.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{role.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <div className="flex flex-col gap-1">
                      {Object.entries(groupedPermissions).map(([page, actions]) => {
                        const perms = role.permissions.filter(p => [actions.view?.id, actions.manage?.id].includes(p.id));
                        if (perms.length === 0) return null;
                        return (
                          <div key={page} className="flex items-center gap-2">
                            <span className="capitalize min-w-[100px]">{page.replace(/_/g, ' ')}:</span>
                            {actions.view && perms.some(p => p.id === actions.view?.id) && <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">View</span>}
                            {actions.manage && perms.some(p => p.id === actions.manage?.id) && <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">Manage</span>}
                          </div>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                    <button
                      className="text-blue-600 hover:bg-blue-50 p-1 rounded-full transition-colors"
                      onClick={() => handleEdit(role)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:bg-red-50 p-1 rounded-full transition-colors"
                      onClick={() => handleDelete(role.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}; 