import { Car, ArrowRightLeft, Banknote, AlertCircle } from "lucide-react";

export function Dashboard() {
  const stats = [
    { label: "Vehicles In (Shift)", value: "142", icon: Car },
    { label: "Vehicles Out", value: "98", icon: ArrowRightLeft },
    { label: "Revenue Collected", value: "1,450,000 ₫", icon: Banknote },
    { label: "Pending Exceptions", value: "3", icon: AlertCircle, danger: true },
  ];

  const occupancy = [
    { zone: "B1 - Motorbikes", used: 450, total: 500, percent: 90 },
    { zone: "B2 - Cars", used: 120, total: 200, percent: 60 },
    { zone: "L1 - EV & VIP", used: 15, total: 20, percent: 75 },
    { zone: "Ground - Bicycles", used: 30, total: 100, percent: 30 },
  ];

  const recentSessions = [
    { id: "S-1029", plate: "30G-123.45", type: "Car", timeIn: "08:15 AM", gate: "Gate 1", status: "Parked" },
    { id: "S-1028", plate: "29A-998.22", type: "Car", timeIn: "08:12 AM", gate: "Gate 2", status: "Parked" },
    { id: "S-1027", plate: "59F1-445.67", type: "Motorbike", timeIn: "08:10 AM", gate: "Gate 1", status: "Parked" },
    { id: "S-1026", plate: "30F-555.55", type: "Car", timeIn: "08:05 AM", gate: "Gate 2", status: "Completed" },
    { id: "S-1025", plate: "29C1-123.99", type: "Motorbike", timeIn: "08:01 AM", gate: "Gate 1", status: "Parked" },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Shift Banner */}
      <div className="bg-[#eff0ef] rounded-lg p-3 px-4 flex items-center justify-between text-sm font-medium border border-gray-200">
        <span className="text-[#060606]/70">Shift Overview</span>
        <div className="flex gap-4 text-[#060606]">
          <span>Shift: 06:00 – 14:00</span>
          <span className="text-gray-300">|</span>
          <span>Gate: Gate 2</span>
          <span className="text-gray-300">|</span>
          <span>Staff: Nguyen Van A</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium tracking-tight">Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#060606]/60 font-medium">{stat.label}</span>
              <div className={`p-2 rounded-lg ${stat.danger ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-[#060606]'}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <div className={`text-2xl font-semibold ${stat.danger ? 'text-red-600' : 'text-[#060606]'}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content Area: Recent Sessions */}
        <div className="col-span-2 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-medium">Recent Check-ins (This Shift)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-[#060606]/60 bg-gray-50/50">
                    <th className="px-5 py-3 font-medium">Session ID</th>
                    <th className="px-5 py-3 font-medium">License Plate</th>
                    <th className="px-5 py-3 font-medium">Type</th>
                    <th className="px-5 py-3 font-medium">Time In</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentSessions.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3 font-medium text-[#060606]">{row.id}</td>
                      <td className="px-5 py-3 font-mono">{row.plate}</td>
                      <td className="px-5 py-3">{row.type}</td>
                      <td className="px-5 py-3">{row.timeIn}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          row.status === 'Completed' ? 'bg-gray-100 text-gray-700' : 'bg-green-50 text-green-700'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Occupancy */}
        <div className="col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-base font-medium mb-4">Zone Occupancy</h2>
            <div className="space-y-5">
              {occupancy.map((zone) => (
                <div key={zone.zone} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-[#060606]">{zone.zone}</span>
                    <span className="text-[#060606]/60 text-xs">
                      {zone.used} / {zone.total}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        zone.percent >= 90 ? 'bg-red-500' : 
                        zone.percent >= 75 ? 'bg-orange-400' : 'bg-[#d7ee46]'
                      }`}
                      style={{ width: `${zone.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}