'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

type Row = {
  uid: string
  id: string
  name: string
  modelName: string
  seats: number | ''
  dailyRate: number | ''
}

type Props = {
  initial: { id: string; name: string; modelName: string; seats: number; dailyRate: number }[]
}

const inputClass =
  'block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'

let counter = 0
const nextUid = () => `new-${(counter += 1)}`

export function VehicleRatesEditor({ initial }: Props) {
  const [rows, setRows] = useState<Row[]>(
    initial.map((vehicle) => ({ ...vehicle, uid: vehicle.id })),
  )

  const update = (uid: string, patch: Partial<Row>) =>
    setRows((current) => current.map((row) => (row.uid === uid ? { ...row, ...patch } : row)))

  return (
    <div className="space-y-4">
      <div className="hidden grid-cols-[1.4fr_1.4fr_0.7fr_0.9fr_auto] gap-3 px-1 text-xs font-semibold uppercase tracking-wider text-gray-500 md:grid">
        <span>Véhicule</span>
        <span>Modèle indicatif</span>
        <span>Places</span>
        <span>Prix / jour (€)</span>
        <span className="w-9" />
      </div>

      {rows.map((row) => (
        <div
          key={row.uid}
          className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-[1.4fr_1.4fr_0.7fr_0.9fr_auto] md:items-center md:border-0 md:bg-transparent md:p-0"
        >
          <input type="hidden" name="vehicleId" value={row.id} />
          <label className="block text-xs font-medium text-gray-600 md:text-[0px]">
            Véhicule
            <input
              className={inputClass}
              name="vehicleName"
              value={row.name}
              onChange={(event) => update(row.uid, { name: event.target.value })}
              placeholder="4x4, Mini van…"
              maxLength={100}
              required
            />
          </label>
          <label className="block text-xs font-medium text-gray-600 md:text-[0px]">
            Modèle indicatif
            <input
              className={inputClass}
              name="vehicleModel"
              value={row.modelName}
              onChange={(event) => update(row.uid, { modelName: event.target.value })}
              placeholder="Prado, Grand Starex…"
              maxLength={100}
            />
          </label>
          <label className="block text-xs font-medium text-gray-600 md:text-[0px]">
            Places
            <input
              className={inputClass}
              name="vehicleSeats"
              type="number"
              inputMode="numeric"
              min={1}
              max={100}
              step={1}
              value={row.seats}
              onChange={(event) =>
                update(row.uid, { seats: event.target.value === '' ? '' : Number(event.target.value) })
              }
              required
            />
          </label>
          <label className="block text-xs font-medium text-gray-600 md:text-[0px]">
            Prix par jour (€)
            <input
              className={inputClass}
              name="vehicleRate"
              type="number"
              inputMode="numeric"
              min={0}
              max={100000}
              step={1}
              value={row.dailyRate}
              onChange={(event) =>
                update(row.uid, { dailyRate: event.target.value === '' ? '' : Number(event.target.value) })
              }
              required
            />
          </label>
          <button
            type="button"
            onClick={() => setRows((current) => current.filter((item) => item.uid !== row.uid))}
            disabled={rows.length <= 1}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`Supprimer ${row.name || 'ce véhicule'}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() =>
          setRows((current) => [
            ...current,
            { uid: nextUid(), id: '', name: '', modelName: '', seats: 4, dailyRate: '' },
          ])
        }
        className="inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-blue-500 hover:text-blue-600"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Ajouter un véhicule
      </button>
    </div>
  )
}
