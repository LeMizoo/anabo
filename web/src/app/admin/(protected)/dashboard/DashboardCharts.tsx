'use client'

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

type ChartData = {
  name: string
  demandes: number
}

type StatusData = {
  name: string
  value: number
}

// Couleurs associées aux statuts
const STATUS_COLORS: Record<string, string> = {
  'NOUVEAU': '#2563EB',      // Bleu
  'CONTACTE': '#EAB308',     // Jaune
  'DEVIS_ENVOYE': '#9333EA', // Violet
  'CONFIRME': '#16A34A',     // Vert
  'PERDU': '#DC2626',        // Rouge
}

// Traduction des statuts pour l'affichage
const STATUS_LABELS: Record<string, string> = {
  'NOUVEAU': 'Nouveau',
  'CONTACTE': 'Contacté',
  'DEVIS_ENVOYE': 'Devis envoyé',
  'CONFIRME': 'Confirmé',
  'PERDU': 'Perdu',
}

export default function DashboardCharts({ data, statusData }: { data: ChartData[], statusData: StatusData[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Graphique 1 : Demandes par mois */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Demandes par mois</h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} allowDecimals={false} />
              <Tooltip 
                cursor={{ fill: '#F3F4F6' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="demandes" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Graphique 2 : Répartition par statut */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Répartition par statut</h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#9CA3AF'} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any, name: any) => [value, STATUS_LABELS[name] || name]}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend 
                formatter={(value) => STATUS_LABELS[value] || value}
                iconType="circle"
                wrapperStyle={{ fontSize: '14px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  )
}