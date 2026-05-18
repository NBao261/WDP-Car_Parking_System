import { Search, Filter, MoreHorizontal, AlertCircle } from "lucide-react";
import { useState } from "react";

export function ActiveSessions() {
  const [sessions] = useState([
    { id: "S-1029", plate: "30G-123.45", type: "Car", zone: "B2-10", timeIn: "08:15", duration: "2h 15m", estFee: "30,000", status: "Parked", overstay: false },
    { id: "S-1028", plate: "29A-998.22", type: "Car", zone: "B2-12", timeIn: "08:12", duration: "2h 18m", estFee: "30,000", status: "Pending exit", overstay: false },
    { id: "S-1027", plate: "59F1-445.67", type: "Motorbike", zone: "B1-05", timeIn: "18:10 (Yesterday)", duration: "16h 20m", estFee: "15,000", status: "Parked", overstay: true },
    { id: "S-1025", plate: "29C1-123.99", type: "Motorbike", zone: "B1-22", timeIn: "08:01", duration: "2h 29m", estFee: "5,000", status: "Parked", overstay: false },
  ]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium tracking-tight">Active Sessions</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        {/* Toolbar / Filters */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by plate or Session ID..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46] focus:border-transparent transition-shadow"
            />
          </div>
          
          <select className="bg-white border border-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#d7ee46] appearance-none">
            <option>All Vehicle Types</option>
            <option>Car</option>
            <option>Motorbike</option>
            <option>EV</option>
            <option>Bicycle</option>
          </select>

          <select className="bg-white border border-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#d7ee46] appearance-none">
            <option>All Zones</option>
            <option>B1</option>
            <option>B2</option>
            <option>Ground</option>
          </select>

          <button className="p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-600 ml-auto">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-[#060606]/60 bg-white">
                <th className="px-5 py-3 font-medium">Session ID</th>
                <th className="px-5 py-3 font-medium">License Plate</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Zone/Slot</th>
                <th className="px-5 py-3 font-medium">Time In</th>
                <th className="px-5 py-3 font-medium">Duration</th>
                <th className="px-5 py-3 font-medium">Est. Fee (₫)</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sessions.map((row) => (
                <tr 
                  key={row.id} 
                  className={`hover:bg-gray-50/50 transition-colors ${row.overstay ? 'border-l-4 border-l-red-500 bg-red-50/10' : ''}`}
                >
                  <td className="px-5 py-3 font-medium text-[#060606]">{row.id}</td>
                  <td className="px-5 py-3 font-mono">
                    <div className="flex items-center gap-2">
                      {row.plate}
                      {row.overstay && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                    </div>
                  </td>
                  <td className="px-5 py-3">{row.type}</td>
                  <td className="px-5 py-3 text-[#060606]/70">{row.zone}</td>
                  <td className="px-5 py-3 text-[#060606]/70">{row.timeIn}</td>
                  <td className={`px-5 py-3 ${row.overstay ? 'text-red-600 font-medium' : 'text-[#060606]/70'}`}>{row.duration}</td>
                  <td className="px-5 py-3 font-medium">{row.estFee}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      row.overstay ? 'bg-red-50 text-red-700' :
                      row.status === 'Pending exit' ? 'bg-orange-50 text-orange-700' : 
                      'bg-green-50 text-green-700'
                    }`}>
                      {row.overstay ? 'Overstay' : row.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right space-x-3">
                    <button className="text-sm font-medium hover:underline text-[#060606]/70">Details</button>
                    <button className="text-sm font-medium bg-[#d7ee46] text-[#060606] px-3 py-1.5 rounded-lg hover:brightness-95 transition-all">
                      Check out
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-[#060606]/60 bg-white">
          <span>Showing 1 to 4 of 42 entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-gray-200 rounded disabled:opacity-50">Prev</button>
            <button className="px-3 py-1 border border-gray-200 rounded bg-[#d7ee46] text-[#060606] border-[#d7ee46]">1</button>
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">2</button>
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">3</button>
            <button className="px-3 py-1 border border-gray-200 rounded">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}