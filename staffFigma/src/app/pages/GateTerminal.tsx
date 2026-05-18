import { useState, useEffect, useRef } from "react";
import { Maximize, Minimize, AlertTriangle, CheckCircle2, Zap, Upload, FileText, Printer, ArrowRight, Search, ShieldCheck } from "lucide-react";
import { LicensePlateInput } from "../components/LicensePlateInput";
import { SessionCard } from "../components/SessionCard";
import { QRDisplay } from "../components/QRDisplay";

export function GateTerminal() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExceptionModal, setShowExceptionModal] = useState(false);
  const [exceptionContext, setExceptionContext] = useState<"in" | "out">("in");
  const containerRef = useRef<HTMLDivElement>(null);

  // ==========================================
  // Check-in State (Manual Entry)
  // ==========================================
  const [inStep, setInStep] = useState<1 | 2 | 3>(1);
  const [inGate, setInGate] = useState("Gate 1 (Entry)");
  const [inType, setInType] = useState("Car");
  const [inPlate, setInPlate] = useState("");
  const [isCheckingConditions, setIsCheckingConditions] = useState(false);

  const vehicleTypes = ["Car", "Motorbike", "EV", "Bicycle"];
  const suggestedZone = inType === "Motorbike" ? "B1 - Motorbikes" : inType === "EV" ? "L1 - EV Charging" : "B2 - Cars";

  const handleCheckConditions = () => {
    if (!inPlate) return;
    setIsCheckingConditions(true);
    setTimeout(() => {
      setIsCheckingConditions(false);
      setInStep(2);
    }, 1000);
  };

  const handleCreateSession = () => {
    setInStep(3);
  };

  const handleNewCheckIn = () => {
    setInStep(1);
    setInPlate("");
  };

  // ==========================================
  // Check-out State (Manual Entry)
  // ==========================================
  const [outStep, setOutStep] = useState<1 | 2>(1);
  const [outPlate, setOutPlate] = useState("");
  const [isSearchingOut, setIsSearchingOut] = useState(false);

  const handleSearchSession = () => {
    if (!outPlate) return;
    setIsSearchingOut(true);
    setTimeout(() => {
      setIsSearchingOut(false);
      setOutStep(2); // Show matched session
    }, 1000);
  };

  const handleCompleteCheckOut = () => {
    setOutStep(1);
    setOutPlate("");
  };

  // ==========================================
  // Global Actions
  // ==========================================
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Fullscreen error: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !showExceptionModal) {
        e.preventDefault();
        alert("Action Logged: Manual Barrier Open triggered by Staff (N.T Yen Nhi) at " + new Date().toLocaleTimeString());
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showExceptionModal]);

  return (
    <div ref={containerRef} className={`flex flex-col h-full bg-[#f4f5f4] ${isFullscreen ? 'p-6 fixed inset-0 z-50' : 'pb-10 max-w-[1400px] mx-auto'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-xl font-semibold flex items-center gap-3">
          Gate Terminal 
          <span className="text-sm font-normal text-white bg-[#060606] px-2.5 py-1 rounded-full">
            Manual Mode
          </span>
        </h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-[#060606]/60 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
            <Zap className="w-4 h-4 text-[#d7ee46] fill-[#d7ee46]" />
            Press <kbd className="font-mono bg-white border border-gray-300 rounded px-1.5 py-0.5 text-xs text-[#060606]">Enter</kbd> to quick-open barrier
          </div>
          <button 
            onClick={toggleFullscreen}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-[#060606] rounded-lg transition-colors border border-gray-200"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Split Screen Container */}
      <div className="flex-1 flex gap-6 min-h-0">
        
        {/* =========================================
            LEFT PANEL: CHECK-IN (ENTRY)
        ========================================= */}
        <div className="w-1/2 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 font-medium text-lg flex items-center justify-between">
            <span>Check-in (Entry)</span>
            <span className="text-sm text-[#060606]/50">Manual Input</span>
          </div>

          <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
            {inStep === 1 && (
              <div className="space-y-6 flex-1 flex flex-col">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#060606]/80">Entry Gate</label>
                    <select 
                      value={inGate}
                      onChange={(e) => setInGate(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#060606] focus:ring-1 focus:ring-[#060606] appearance-none font-medium"
                    >
                      <option>Gate 1 (Entry)</option>
                      <option>Gate 2 (Mixed)</option>
                      <option>VIP Entry</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#060606]/80">Vehicle Type</label>
                    <select 
                      value={inType}
                      onChange={(e) => setInType(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#060606] focus:ring-1 focus:ring-[#060606] appearance-none font-medium"
                    >
                      {vehicleTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full space-y-3">
                  <label className="block text-base font-medium text-center text-[#060606]">Enter License Plate</label>
                  <LicensePlateInput 
                    value={inPlate} 
                    onChange={(e) => setInPlate(e.target.value)} 
                    autoFocus
                  />
                </div>

                <button 
                  onClick={handleCheckConditions}
                  disabled={!inPlate || isCheckingConditions}
                  className="w-full py-4 bg-[#d7ee46] text-[#060606] font-semibold rounded-xl hover:brightness-95 transition-all text-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCheckingConditions ? (
                    <span className="animate-pulse">Checking Conditions...</span>
                  ) : (
                    <>Check Conditions <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>
              </div>
            )}

            {inStep === 2 && (
              <div className="space-y-6 flex-1 flex flex-col">
                <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-start gap-4">
                  <ShieldCheck className="w-8 h-8 text-green-600 shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">Conditions Met</h3>
                    <p className="text-green-700 text-sm mt-1">Vehicle <strong>{inPlate}</strong> is not on any blocklists. Active subscription: None (Standard ticket applies).</p>
                  </div>
                </div>

                <div className="bg-white border-2 border-[#d7ee46] rounded-xl p-5 shadow-sm space-y-2">
                  <div className="text-sm font-medium text-[#060606]/60">System Suggestion</div>
                  <div className="text-xl font-bold flex items-center justify-between">
                    Assign to: {suggestedZone}
                    <span className="text-sm font-medium bg-[#d7ee46]/20 text-[#060606] px-3 py-1 rounded-full">
                      45 slots free
                    </span>
                  </div>
                </div>

                <SessionCard 
                  plate={inPlate}
                  type={inType}
                  zone={suggestedZone}
                  gate={inGate}
                  time={new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                />

                <div className="mt-auto grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setInStep(1)}
                    className="py-4 bg-white border border-gray-300 text-[#060606] font-semibold rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Back to Edit
                  </button>
                  <button 
                    onClick={handleCreateSession}
                    className="py-4 bg-[#060606] text-white font-semibold rounded-xl hover:bg-gray-800 transition-all shadow-sm"
                  >
                    Confirm Session
                  </button>
                </div>
              </div>
            )}

            {inStep === 3 && (
              <div className="flex-1 flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-1">Session Created</h2>
                  <p className="text-[#060606]/60">Barrier opening initialized</p>
                </div>

                <div className="w-full max-w-sm">
                  <QRDisplay 
                    value={`TKT-${Math.floor(1000 + Math.random() * 9000)}`} 
                    subtitle={`Plate: ${inPlate} • ${inType}`}
                    onPrint={() => alert("Printing ticket...")}
                  />
                </div>

                <button 
                  onClick={handleNewCheckIn}
                  className="w-full py-4 bg-[#d7ee46] text-[#060606] font-semibold rounded-xl hover:brightness-95 transition-all text-lg shadow-sm mt-4"
                >
                  New Check-in
                </button>
              </div>
            )}

            <div className="mt-auto pt-4 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => { setExceptionContext("in"); setShowExceptionModal(true); }}
                className="text-orange-600 font-medium text-sm flex items-center gap-1.5 hover:underline"
              >
                <AlertTriangle className="w-4 h-4" />
                Flag Exception
              </button>
            </div>
          </div>
        </div>

        {/* =========================================
            RIGHT PANEL: CHECK-OUT (EXIT)
        ========================================= */}
        <div className="w-1/2 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 font-medium text-lg flex items-center justify-between">
            <span>Check-out (Exit)</span>
            {outStep === 2 && (
              <span className="text-xs font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-md flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> MATCHED
              </span>
            )}
          </div>
          
          <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
            
            {outStep === 1 && (
              <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-[#060606]/40" />
                  </div>
                  <h3 className="text-xl font-bold">Search Active Session</h3>
                  <p className="text-sm text-[#060606]/60">Enter license plate to process exit</p>
                </div>
                
                <div className="space-y-3">
                  <LicensePlateInput 
                    value={outPlate} 
                    onChange={(e) => setOutPlate(e.target.value)} 
                  />
                  <button 
                    onClick={handleSearchSession}
                    disabled={!outPlate || isSearchingOut}
                    className="w-full py-4 bg-[#060606] text-white font-semibold rounded-xl hover:bg-gray-800 transition-all text-lg shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSearchingOut ? "Searching Database..." : "Find Session"}
                  </button>
                </div>
              </div>
            )}

            {outStep === 2 && (
              <div className="space-y-6 flex-1 flex flex-col">
                <SessionCard 
                  plate={outPlate}
                  type="Car"
                  zone="B2 - Cars"
                  gate="Gate 2 (Exit)"
                  time="08:15 AM (Today)"
                  sessionId="S-1030"
                />

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mt-auto">
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <div className="text-sm text-[#060606]/60 mb-1">Total Duration</div>
                      <div className="font-mono text-2xl font-bold">2h 15m</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-[#060606]/60 mb-1">Amount Due</div>
                      <div className="text-3xl font-bold text-[#d7ee46] drop-shadow-sm bg-[#060606] px-4 py-1.5 rounded-lg inline-block">15,000 ₫</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                     <button 
                        onClick={() => setOutStep(1)}
                        className="col-span-1 py-4 bg-white border border-gray-300 text-[#060606] font-semibold rounded-xl hover:bg-gray-50 transition-all"
                      >
                        Cancel
                      </button>
                    <button 
                      onClick={handleCompleteCheckOut}
                      className="col-span-2 py-4 bg-[#d7ee46] text-[#060606] font-semibold rounded-xl hover:brightness-95 transition-all text-lg shadow-sm"
                    >
                      Complete & Open Barrier
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-auto pt-4 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => { setExceptionContext("out"); setShowExceptionModal(true); }}
                className="text-orange-600 font-medium text-sm flex items-center gap-1.5 hover:underline"
              >
                <AlertTriangle className="w-4 h-4" />
                Flag Exception
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Exception Modal (Unchanged structurally, just visual adjustments) */}
      {showExceptionModal && (
        <div className="fixed inset-0 bg-[#060606]/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-[#060606]">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Report Exception ({exceptionContext === "in" ? "Entry" : "Exit"})
              </h3>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">Exception Type</label>
                <select className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46] appearance-none">
                  <option>Vehicle parked in wrong slot</option>
                  <option>Physical slot issue (cracked/damaged)</option>
                  <option>System error / Match failed</option>
                  <option>Uncooperative driver</option>
                  <option>Other / Manual review required</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea 
                  rows={3}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46] resize-none"
                  placeholder="Provide context for the manager..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Attach Image (Optional)</label>
                <button className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-sm text-[#060606]/60 hover:bg-gray-50 transition-colors flex flex-col items-center gap-1">
                  <Upload className="w-5 h-5 text-gray-400" />
                  Click to upload or capture image
                </button>
              </div>

              <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded-lg flex items-start gap-2">
                <FileText className="w-4 h-4 mt-0.5 shrink-0" />
                A ticket will be generated and a push notification sent to the Manager's mobile app.
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => setShowExceptionModal(false)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-[#060606] hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowExceptionModal(false)}
                className="px-4 py-2 bg-[#060606] text-white rounded-lg text-sm font-medium hover:bg-gray-800"
              >
                Submit to Manager
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}