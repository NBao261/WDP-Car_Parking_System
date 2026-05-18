import { useState, useMemo } from "react";
import { AlertTriangle, Clock, MapPin, Car, Camera, CheckCircle2, User, FileText, Settings, ShieldAlert, AlertCircle, Info } from "lucide-react";

export function Exceptions() {
  const [basement, setBasement] = useState("");
  const [staffName, setStaffName] = useState("N.T Yen Nhi");
  const [exceptionType, setExceptionType] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Auto-generated context
  const timestamp = new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
  const reportId = useMemo(() => `EXC-${new Date().toISOString().slice(0,10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`, []);

  const exceptionOptions = [
    "Lost ticket",
    "Wrong plate",
    "Overstay",
    "Wrong zone",
    "Slot status",
    "Barrier fault",
    "Other"
  ];

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center space-y-6">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-2">Exception Logged</h2>
          <p className="text-[#060606]/60">Ticket {reportId} has been created and sent to Manager Queue.</p>
        </div>
        <button 
          onClick={() => { setIsSubmitted(false); setExceptionType(""); }}
          className="px-6 py-3 bg-[#060606] text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
        >
          Report Another Exception
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-10 space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-medium tracking-tight">Report Exception</h1>
        <div className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium border border-orange-100 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" /> Priority Logging Active
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column: Context (Always visible) */}
        <div className="col-span-1 space-y-6">
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
            <h3 className="font-medium flex items-center gap-2 text-[#060606] border-b border-gray-100 pb-3">
              <Info className="w-4 h-4 text-[#060606]/60" />
              General Info
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="block text-[#060606]/50 mb-0.5 text-xs">Report ID</span>
                <span className="font-mono font-medium">{reportId}</span>
              </div>
              <div>
                <span className="block text-[#060606]/50 mb-0.5 text-xs">Timestamp</span>
                <div className="flex items-center gap-1.5 font-medium"><Clock className="w-3.5 h-3.5" /> {timestamp}</div>
              </div>
              <div>
                <span className="block text-[#060606]/50 mb-0.5 text-xs">Location</span>
                <div className="flex items-center gap-1.5 font-medium"><MapPin className="w-3.5 h-3.5" /> Topaz 2 • Gate 2</div>
              </div>
              <div>
                <span className="block text-[#060606]/50 mb-0.5 text-xs">Shift</span>
                <span className="font-medium">06:00 - 14:00</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
            <h3 className="font-medium flex items-center gap-2 text-[#060606] border-b border-gray-100 pb-3">
              <Car className="w-4 h-4 text-[#060606]/60" />
              Vehicle Context
            </h3>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="block text-[#060606]/50 mb-0.5 text-xs">Plate</span>
                  <span className="font-mono font-medium text-base">29A-123.45</span>
                </div>
                <div>
                  <span className="block text-[#060606]/50 mb-0.5 text-xs">Type & Color</span>
                  <span className="font-medium">Car • White</span>
                </div>
              </div>
              <div>
                <span className="block text-[#060606]/50 mb-0.5 text-xs">Session & Slot</span>
                <span className="font-medium">S-1030 • Slot B2-45</span>
              </div>
              <div>
                <span className="block text-[#060606]/50 mb-0.5 text-xs">Time In</span>
                <span className="font-medium">08:15 AM</span>
              </div>
              
              <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3 flex flex-col items-center justify-center gap-2 text-center">
                <Camera className="w-5 h-5 text-gray-400" />
                <span className="text-xs text-[#060606]/60">LPR Image automatically attached from Session</span>
              </div>
            </div>
          </div>
          
        </div>

        {/* Right Column: Form */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
            
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">Basement (Hầm)</label>
                <select 
                  value={basement}
                  onChange={(e) => setBasement(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46] appearance-none"
                >
                  <option value="" disabled>Select Basement...</option>
                  <option value="B1">B1 - Motorbikes</option>
                  <option value="B2">B2 - Cars</option>
                  <option value="B3">B3 - Overflow</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Staff Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Exception Type</label>
              <select 
                value={exceptionType}
                onChange={(e) => setExceptionType(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46] appearance-none font-medium text-[#060606]"
              >
                <option value="" disabled>Select exception type...</option>
                {exceptionOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Dynamic Fields based on Exception Type */}
            {exceptionType && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2">
                <h4 className="text-sm font-semibold flex items-center gap-2 border-b border-gray-200 pb-2 mb-4">
                  <Settings className="w-4 h-4" />
                  Specific Details for: {exceptionType}
                </h4>

                {exceptionType === "Lost ticket" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium mb-1">Customer Phone / ID</label>
                      <input type="text" placeholder="e.g. 0901234567" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium mb-1">Upload ID Proof</label>
                      <input type="file" className="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-100 hover:file:bg-gray-200 cursor-pointer" />
                    </div>
                  </div>
                )}

                {exceptionType === "Wrong plate" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1">Actual Correct Plate</label>
                      <input type="text" placeholder="Enter correct plate..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm uppercase font-mono" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Reason for mismatch</label>
                      <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                        <option>Mud/Dirt obscuring plate</option>
                        <option>AI misread character</option>
                        <option>Fake/Changed plate suspected</option>
                      </select>
                    </div>
                  </div>
                )}

                {exceptionType === "Overstay" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1">Extra Time (Hours)</label>
                      <input type="number" placeholder="e.g. 2" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Penalty Application</label>
                      <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                        <option>Standard overtime rate</option>
                        <option>Warning only (Manager approved)</option>
                      </select>
                    </div>
                  </div>
                )}

                {exceptionType === "Wrong zone" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1">Assigned Zone</label>
                      <input type="text" value="B2 - Cars" disabled className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Actual Parked Zone</label>
                      <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                        <option>B1 - Motorbikes (Violation)</option>
                        <option>B3 - Overflow</option>
                        <option>VIP Area</option>
                      </select>
                    </div>
                  </div>
                )}

                {exceptionType === "Slot status" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1">Affected Slot ID</label>
                      <input type="text" placeholder="e.g. B2-99" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Actual Status</label>
                      <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                        <option>Physically Damaged (Cracked/Leaking)</option>
                        <option>Occupied but marked free</option>
                        <option>Free but marked occupied</option>
                      </select>
                    </div>
                  </div>
                )}

                {exceptionType === "Barrier fault" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1">Gate / Barrier ID</label>
                      <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                        <option>Gate 1 (Entry)</option>
                        <option>Gate 2 (Exit)</option>
                        <option>Gate 3 (Exit)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Fault Description</label>
                      <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                        <option>Barrier won't open automatically</option>
                        <option>Barrier won't close</option>
                        <option>Sensor not detecting vehicle</option>
                        <option>Physical damage to arm</option>
                      </select>
                    </div>
                  </div>
                )}

                {exceptionType === "Other" && (
                  <div>
                    <label className="block text-xs font-medium mb-1">Specific Reason</label>
                    <textarea rows={2} placeholder="Describe the situation..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none" />
                  </div>
                )}
              </div>
            )}

            {/* Processing & Approval Section */}
            {exceptionType && (
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="font-medium flex items-center gap-2 text-[#060606] mb-4">
                  <FileText className="w-4 h-4 text-[#060606]/60" />
                  Processing & Resolution
                </h3>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-[#060606]/70">Action Taken</label>
                    <select className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46]">
                      <option>Logged for review</option>
                      <option>Manual override triggered</option>
                      <option>Informed Manager via phone</option>
                      <option>Customer warned & released</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-[#060606]/70">Priority</label>
                    <select className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46]">
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Critical (Requires immediate attention)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5 text-[#060606]/70">Internal Notes</label>
                  <textarea 
                    rows={2}
                    placeholder="Add context for auditors or managers..."
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46] resize-none"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    onClick={() => setIsSubmitted(true)}
                    className="px-6 py-3 bg-[#d7ee46] text-[#060606] font-medium rounded-xl hover:brightness-95 transition-all text-sm flex items-center gap-2"
                  >
                    Submit Exception Report
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}