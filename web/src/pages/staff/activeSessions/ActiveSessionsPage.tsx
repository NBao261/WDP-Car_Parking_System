import { useState, useEffect, useCallback } from "react";
import { Search, Clock, RefreshCw, Car, Bike, Filter, Calendar, AlertCircle } from "lucide-react";
import { apiClient } from "../../../services/api";
import { useAuthStore } from "../../../store/useAuthStore";
import { AssignedFacility } from "../../../types/user.types";

// ── Types phản ánh đúng response của BE (/sessions/active) ────────────────────
interface ActiveSession {
  _id: string;
  code: string;
  licensePlate: string;
  /** Populated object từ BE */
  vehicleTypeId?: { name: string; code: string };
  /** Populated object từ BE */
  floorId?: { name: string };
  /** Populated object từ BE */
  facilityId?: { name: string };
  checkInTime: string;
  gateIn: string;
  status: string;
}

export default function ActiveSessionsPage() {
  const { user } = useAuthStore();
  const assignedFacilities = (user?.assignedFacilities ?? []) as AssignedFacility[];

  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const params: Record<string, any> = {
        page,
        limit: 10,
        sortBy: "checkInTime",
        sortOrder: "desc",
      };

      if (searchTerm.trim()) params.licensePlate = searchTerm.trim();
      if (selectedFacilityId) params.facilityId = selectedFacilityId;

      const res: any = await apiClient.get("/sessions/active", { params });

      setSessions(res.data ?? []);
      setTotal(res.total ?? 0);
      setTotalPages(res.totalPages ?? 1);
    } catch (err: any) {
      setFetchError(err.message || "Không thể tải danh sách session. Vui lòng thử lại.");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, selectedFacilityId]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchSessions();
    }, 400);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedFacilityId]);

  useEffect(() => {
    fetchSessions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const getTimeElapsed = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const isCarType = (code?: string) =>
    code?.toLowerCase().includes("car") || code?.toLowerCase().includes("oto");

  return (
    <div className="flex flex-col h-full bg-[#f4f5f4] p-6 pb-10 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-xl font-bold flex items-center gap-3 text-[#060606]">
          Active Parking Sessions
          <span className="text-xs font-semibold text-white bg-blue-600 px-3 py-1 rounded-full tracking-wider">
            {total} VEHICLES
          </span>
        </h1>
        <button
          onClick={fetchSessions}
          className="p-2.5 bg-gray-100 hover:bg-gray-200 text-[#060606] rounded-xl transition-colors border border-gray-200"
          title="Làm mới"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between bg-gray-50/50">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo biển số..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Facility filter — chỉ hiện khi Staff được gán nhiều bãi */}
          {assignedFacilities.length > 1 && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={selectedFacilityId}
                onChange={(e) => { setSelectedFacilityId(e.target.value); setPage(1); }}
                className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="">Tất cả bãi xe</option>
                {assignedFacilities.map((f) => (
                  <option key={f._id} value={f._id}>{f.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Error state */}
        {fetchError && (
          <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {fetchError}
            <button onClick={fetchSessions} className="ml-auto font-bold underline hover:no-underline">
              Thử lại
            </button>
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 font-semibold sticky top-0 border-b border-gray-200 z-10">
              <tr>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">License Plate</th>
                <th className="px-6 py-4">Vehicle Type</th>
                <th className="px-6 py-4">Floor / Zone</th>
                <th className="px-6 py-4">Time Elapsed</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && sessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading active sessions...
                  </td>
                </tr>
              ) : !loading && sessions.length === 0 && !fetchError ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    No active sessions found.
                  </td>
                </tr>
              ) : (
                sessions.map((session) => (
                  <tr key={session._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{session.code}</td>
                    <td className="px-6 py-4">
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded-md font-bold tracking-wider">
                        {session.licensePlate}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <span className="flex items-center gap-2">
                        {isCarType(session.vehicleTypeId?.code)
                          ? <Car className="w-4 h-4" />
                          : <Bike className="w-4 h-4" />
                        }
                        {session.vehicleTypeId?.name ?? "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {session.floorId?.name ?? "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(session.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="font-medium text-orange-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {getTimeElapsed(session.checkInTime)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase">
                        Parked
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm bg-white">
          <span className="text-gray-500">
            Trang {page} / {totalPages} ({total} sessions)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}