import React, { useMemo, useState, useEffect } from "react";
import { useCallback } from "react";
import { Link } from "react-router-dom";
import Input from "../../components/forms/Input.jsx";
import PatientCard from "../../components/patient/PatientCard.jsx";
import EmptyPatients from "../../components/patient/EmptyPatients.jsx";
import { usePatients, useDeletePatient, buildPatientParams } from "../../features/patients/phooks.js";

// simple debounce hook
const useDebounced = (value, ms = 350) => {
   const [v, setV] = useState(value);
   useEffect(() => {
      const t = setTimeout(() => setV(value), ms);
      return () => clearTimeout(t);
    }, [value, ms]);
    return v;
  };

  const norm = (s = "") =>
  String(s).normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();


const AGE_LABELS = [
  { label: "All", value: "All" },
  { label: "Child", value: "0-12" },
  { label: "Teenager", value: "13-17" },
  { label: "Adult", value: "18-59" },
  { label: "Senior", value: "60+" },
];
const BLOOD_TYPES = ["All","O+","O-","A+","A-","B+","B-","AB+","AB-"];
const getAgeValue = (label) => AGE_LABELS.find(x => x.label === label)?.value ?? "All";



export default function PatientsPage() {
  // local UI state
  const [search, setSearch] = useState("");
  const [ageCat, setAgeCat] = useState("All");
  const [blood, setBlood] = useState("All");
  const [page, setPage] = useState(1);
  const [showNoMatch, setShowNoMatch] = useState(false);
  const [allSnapshot, setAllSnapshot] = useState(null);


  const debouncedSearch = useDebounced(search, 350);
  const params = buildPatientParams({
    q: debouncedSearch,
    category: getAgeValue(ageCat),
    bloodtype: blood,
    page,
  });

  const { data, isFetching, isLoading } = usePatients(params);
  const del = useDeletePatient();
  const handleDelete = useCallback((id) => del.mutate(id), [del]);
  const deletingId = del.variables; // último id mutado (React Query)

  const items = data?.items ?? [];
  const pages = data?.pages ?? 1;
  const hasFilters = !!search || ageCat !== "All" || blood !== "All";
  const pendingReset = search === "" && debouncedSearch !== "" && ageCat === "All" && blood === "All";

  const baseItems = useMemo(() => {
   // En el limbo: o snapshot “All” o nada (evita lista parcial)
   if (pendingReset) return allSnapshot ?? [];
   return items;
 }, [pendingReset, allSnapshot, items]);

 const display = useMemo(() => {
  const raw = search.trim();
  const qn = norm(raw);
  if (!qn) return baseItems;

  const isNameQuery =
    /^[a-zñáéíóúü\s]+$/i.test(raw) && !raw.includes("@") && !/\d/.test(raw);

  return baseItems.filter((p) => {
    // Prefijo por palabra en FULLNAME
    const nameTokens = norm(p.fullname || "")
      .split(/[\s,._-]+/)
      .filter(Boolean);
    const nameMatch = nameTokens.some((t) => t.startsWith(qn));

    if (isNameQuery) return nameMatch; // 🔒 sólo nombre

    // Para queries con @ o números: permite también email/phone
    const ep = norm([p.email, p.phone].filter(Boolean).join(" "));
    const epMatch = ep.includes(qn);

    return nameMatch || epMatch;
  });
}, [baseItems, search]);

  useEffect(() => {
  if (!isFetching && !pendingReset) {
    setShowNoMatch(hasFilters && display.length === 0);
  }
}, [isFetching, pendingReset, hasFilters, display.length]);


 useEffect(() => {
  const noServerFilters =
    debouncedSearch === "" && ageCat === "All" && blood === "All";

  if (noServerFilters && data) {
    setAllSnapshot(data.items ?? []);
  }
}, [debouncedSearch, ageCat, blood, data]);


 
  const subtitle = useMemo(() => {
    const parts = [];
    if (search) parts.push(`“${search}”`);
    if (ageCat !== "All") parts.push(ageCat);
    if (blood !== "All") parts.push(`Blood ${blood}`);
    return parts.length ? `${parts.join(" · ")} — ${display.length} found` : `Showing ${items.length} patients`;
  }, [search, ageCat, blood, display.length, items.length]);

  const clearFilters = () => {
    setSearch(""); setAgeCat("All"); setBlood("All"); setPage(1); setShowNoMatch(false);
  };

  if (isLoading && !data) {
    return null; // o un skeleton si prefieres
  }
  // Empty (no filters) and not loading
  if (!isLoading && !pendingReset && !hasFilters && items.length === 0) {
    return (
      <main className="mx-auto max-w-6xl p-4">
        <EmptyPatients />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Patients</h1>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
        <Link to="/patients/new" className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Add patient
        </Link>
      </div>

      {/* Filters – search arriba centrado; filtros abajo centrados */}
<section className="mb-6 flex flex-col items-center">
  {/* BUSCADOR (arriba, centrado y ancho) */}
  <form onSubmit={(e) => e.preventDefault()} className="w-full max-w-4xl">
    <Input
      className="w-full h-11"
      type="text"
      placeholder="Search by name, email or phone..."
      value={search}
      onChange={(e) => { setSearch(e.target.value); setPage(1); }}
      onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
    />
  </form>

  {/* FILTROS (abajo, centrados) */}
  <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
    <span className="text-sm font-medium text-gray-700">Age category</span>
    <div className="flex flex-wrap items-center gap-2">
      {AGE_LABELS.map(({ label }) => (
        <button
          key={label}
          type="button"
          onClick={() => { setAgeCat(label); setPage(1); }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            ageCat === label
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {label}
        </button>
      ))}
    </div>

    <span className="text-sm font-medium text-gray-700 ml-2">Blood type</span>
    <select
      className="h-11 w-[14rem] rounded-lg border border-gray-300 bg-white px-3 outline-none focus:ring-2 focus:ring-blue-500"
      value={blood}
      onChange={(e) => { setBlood(e.target.value); setPage(1); }}
    >
      {BLOOD_TYPES.map((b) => (
        <option key={b} value={b}>{b}</option>
      ))}
    </select>

    <button
      type="button"
      onClick={clearFilters}
      className="inline-flex h-11 items-center rounded-2xl bg-slate-900 px-4 text-white hover:bg-black cursor-pointer leading-none"
    >
      Clear
    </button>
  </div>
</section>



          {showNoMatch ? (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-gray-100 p-6 mb-4">
        <span className="text-3xl">🔎</span>
      </div>
      <h3 className="text-2xl font-bold">No matching patients</h3>
      <p className="mt-2 max-w-md text-gray-600">
        Try adjusting your search, age category or blood type.
      </p>
      <button
        type="button"
        onClick={clearFilters}
        className="mt-6 inline-block rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-black cursor-pointer"
      >
        Clear filters
      </button>
    </div>
  ) : (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {display.map((p) => (
        <PatientCard
          key={p._id}
          patient={p}
          onDeleted={handleDelete}
          isDeleting={del.isPending && deletingId === p._id}
        />
      ))}
    </div>
  )}

        {pages > 1 && !pendingReset && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((n) => n - 1)}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm text-gray-600">Page {data?.page ?? page} of {pages}</span>
            <button
              type="button"
              disabled={page >= pages || isFetching}
              onClick={() => setPage((n) => n + 1)}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
    </main>
  );
}
