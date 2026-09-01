'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, UserPlus, Check, Lock } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { ROLES, ROLE_MATRIX, PERMISSION_MODULES, ROLE_COLORS } from '@/lib/mock-data/roles'
import type { Permissions, PermissionAction } from '@/types/enterprise'
import { cn } from '@/lib/utils'

const ACTIONS: { id: PermissionAction; label: string }[] = [
  { id: 'create', label: 'Create' },
  { id: 'read', label: 'Read' },
  { id: 'update', label: 'Update' },
  { id: 'delete', label: 'Delete' },
]

export function RolesPage() {
  const [selectedRole, setSelectedRole] = useState('Manager')
  const [matrix, setMatrix] = useState<Record<string, Permissions>>(ROLE_MATRIX)

  const role = ROLES.find((r) => r.name === selectedRole) ?? ROLES[0]
  const permissions = matrix[selectedRole] ?? ROLE_MATRIX.Manager

  const toggle = (module: (typeof PERMISSION_MODULES)[number], action: PermissionAction) => {
    setMatrix((prev) => {
      const current = prev[selectedRole] ?? ROLE_MATRIX.Manager
      return {
        ...prev,
        [selectedRole]: {
          ...current,
          [module]: { ...current[module], [action]: !current[module][action] },
        },
      }
    })
  }

  const enabledCount = PERMISSION_MODULES.reduce(
    (sum, module) => sum + ACTIONS.filter((a) => permissions[module][a.id]).length,
    0,
  )

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Role Management"
        description="Define what each role can see and do across the workspace with a permissions matrix."
        icon={ShieldCheck}
        crumbs={[{ label: 'Settings', href: '/dashboard/settings' }, { label: 'Roles' }]}
        actions={
          <button className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-white shadow-sm shadow-primary/30 transition-colors hover:bg-primary/80 focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none">
            <UserPlus className="h-4 w-4" />
            Create role
          </button>
        }
      />

      {/* Roles */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-900">Roles</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {ROLES.map((r, index) => (
            <motion.button
              key={r.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setSelectedRole(r.name)}
              className={cn(
                'flex flex-col rounded-2xl border p-4 text-left transition-all duration-200 focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none',
                selectedRole === r.name ? 'border-primary/50 bg-accent/40 shadow-md' : 'border-gray-200/70 bg-white shadow-sm hover:-translate-y-0.5 hover:shadow-md',
              )}
            >
              <div className="flex items-center gap-3">
                <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold', ROLE_COLORS[r.name])}>
                  {r.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                    {r.name}
                    {r.builtIn && <Lock className="h-3 w-3 text-gray-400" />}
                  </p>
                  <p className="text-xs text-gray-400">{r.members} members</p>
                </div>
                <span className={cn('flex h-5 w-5 items-center justify-center rounded-full', selectedRole === r.name ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400')}>
                  <Check className="h-3 w-3" />
                </span>
              </div>
              <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-gray-500">{r.description}</p>
              <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2.5">
                <span className="text-[11px] text-gray-400">{r.permissions} permissions</span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">{selectedRole === r.name ? 'Editing' : 'View'}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Permission matrix */}
      <div className="overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/70 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Permissions · {selectedRole}</h3>
            <p className="text-xs text-gray-400">
              {enabledCount} of {PERMISSION_MODULES.length * 4} permissions granted
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-primary">{role.members} members</span>
            <button className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-xs font-medium text-white transition-colors hover:bg-primary/80 focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none">
              Save changes
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">Module</th>
                {ACTIONS.map((action) => (
                  <th key={action.id} className="px-4 py-3 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase">{action.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSION_MODULES.map((module, rowIndex) => (
                <motion.tr
                  key={module}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: rowIndex * 0.03 }}
                  className="border-b border-gray-50 hover:bg-gray-50/50"
                >
                  <td className="px-5 py-3 text-sm font-medium text-gray-800">{module}</td>
                  {ACTIONS.map((action) => {
                    const checked = permissions[module][action.id]
                    return (
                      <td key={action.id} className="px-4 py-3 text-center">
                        <button
                          role="checkbox"
                          aria-checked={checked}
                          aria-label={`${module} — ${action.label}`}
                          onClick={() => toggle(module, action.id)}
                          className={cn(
                            'inline-flex h-6 w-6 items-center justify-center rounded-md border transition-all duration-150 focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none',
                            checked ? 'border-primary bg-primary text-white shadow-sm' : 'border-gray-200 bg-white text-transparent hover:border-gray-300',
                          )}
                        >
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        </button>
                      </td>
                    )
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
