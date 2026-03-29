/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Plus, Edit, Layers, X, School } from "lucide-react";
import { InlineSpinner } from "@/components/PageSpinner";
import ErrorBanner from "@/components/ErrorBanner";
import EmptyState from "@/components/EmptyState";

export default function AdminSchools() {
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [showSchoolForm, setShowSchoolForm] = useState(false);
  const [formData, setFormData] = useState({ id: "", name: "", board: "CBSE", city: "", state: "", isActive: true });
  const [saving, setSaving] = useState(false);

  // Standards Modal states
  const [showStandardsModal, setShowStandardsModal] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [schoolStandards, setSchoolStandards] = useState<any[]>([]);
  const [newStandard, setNewStandard] = useState({ className: "", gender: "boy" });
  const [savingStandard, setSavingStandard] = useState(false);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/schools?admin=true");
      setSchools(res.data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load schools. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (formData.id) {
        await api.put(`/schools/${formData.id}`, formData);
      } else {
        await api.post("/schools", formData);
      }
      setShowSchoolForm(false);
      fetchSchools();
    } catch (err) {
      console.error(err);
      alert("Failed to save school");
    } finally {
      setSaving(false);
    }
  };

  const openAddForm = () => {
    setFormData({ id: "", name: "", board: "CBSE", city: "", state: "", isActive: true });
    setShowSchoolForm(true);
  };

  const openEditForm = (school: any) => {
    setFormData({ 
      id: school._id, 
      name: school.name, 
      board: school.board, 
      city: school.city, 
      state: school.state, 
      isActive: school.isActive 
    });
    setShowSchoolForm(true);
  };

  const fetchStandardsForSchool = async (schoolId: string) => {
    try {
      const res = await api.get(`/standards?school=${schoolId}`);
      setSchoolStandards(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const openStandardsModal = (school: any) => {
    setSelectedSchool(school);
    setShowStandardsModal(true);
    fetchStandardsForSchool(school._id);
  };

  const handleSaveStandard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchool) return;

    setSavingStandard(true);
    try {
      await api.post("/standards", {
        school: selectedSchool._id,
        className: newStandard.className,
        gender: newStandard.gender
      });
      setNewStandard({ className: "", gender: "boy" });
      fetchStandardsForSchool(selectedSchool._id);
    } catch (err) {
      console.error(err);
      alert("Failed to save standard");
    } finally {
      setSavingStandard(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-heading text-brand-secondary">Manage Schools</h1>
        <button 
          onClick={openAddForm}
          className="bg-brand-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-primary/90 transition-all shadow-md shadow-brand-primary/20"
        >
          <Plus size={20} /> Add School
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 min-h-[400px]">
        {loading ? (
          <div className="py-20">
            <InlineSpinner message="Loading schools..." />
          </div>
        ) : error ? (
          <div className="py-10">
            <ErrorBanner type="server" message={error} onRetry={fetchSchools} />
          </div>
        ) : schools.length === 0 ? (
          <div className="py-10">
            <EmptyState 
              icon={School} 
              title="No Schools Yet" 
              description="You haven't added any schools to the system. Click 'Add School' to get started." 
              action={{ label: "Add Your First School", href: "#" }}
              onClick={openAddForm}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-sm text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="pb-4 font-normal">School Name</th>
                  <th className="pb-4 font-normal">Board</th>
                  <th className="pb-4 font-normal hidden md:table-cell">Location</th>
                  <th className="pb-4 font-normal hidden sm:table-cell">Status</th>
                  <th className="pb-4 font-normal text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {schools.map((school) => (
                  <tr key={school._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-4 font-bold text-brand-secondary">{school.name}</td>
                    <td className="py-4 text-gray-500">{school.board}</td>
                    <td className="py-4 text-gray-500 hidden md:table-cell">{school.city}, {school.state}</td>
                    <td className="py-4 hidden sm:table-cell">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        school.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {school.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 text-right flex justify-end gap-1 sm:gap-2">
                      <button
                        onClick={() => openStandardsModal(school)}
                        className="text-brand-accent hover:bg-brand-accent/10 p-2 rounded-full inline-flex transition-colors cursor-pointer"
                        title="Manage Classes (Standards)"
                      >
                        <Layers size={16} />
                      </button>
                      <button
                        onClick={() => openEditForm(school)}
                        className="text-brand-primary hover:bg-brand-primary/10 p-2 rounded-full inline-flex transition-colors cursor-pointer"
                        title="Edit School details"
                      >
                        <Edit size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Standards Form Modal */}
      {showStandardsModal && selectedSchool && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-heading text-brand-secondary">
                Classes for {selectedSchool.name}
              </h2>
              <button onClick={() => setShowStandardsModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* List existing standards */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-400 uppercase mb-3 tracking-wider">Existing Classes</h3>
              {schoolStandards.length === 0 ? (
                <div className="bg-gray-50 p-4 rounded-xl text-center text-sm text-gray-500">
                  No classes added to this school yet. Add one below to start listing uniforms!
                </div>
              ) : (
                <ul className="space-y-2 max-h-[200px] overflow-y-auto">
                  {schoolStandards.map(std => (
                    <li key={std._id} className="bg-gray-50 p-3 rounded-xl flex justify-between items-center text-sm">
                      <span className="font-bold text-brand-secondary">{std.className}</span>
                      <span className="px-2 py-1 bg-white rounded-lg text-gray-500 text-xs shadow-sm capitalize">{std.gender}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Add new Standard form */}
            <div className="bg-brand-bg/30 p-5 rounded-2xl border border-brand-primary/10">
              <h3 className="text-sm font-bold text-brand-secondary mb-3">Register New Class</h3>
              <form onSubmit={handleSaveStandard} className="flex flex-col sm:flex-row gap-3">
                <input
                  required
                  type="text"
                  placeholder="e.g. Grade 5"
                  value={newStandard.className}
                  onChange={(e) => setNewStandard({...newStandard, className: e.target.value})}
                  className="flex-1 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary/20 outline-none text-sm"
                />
                <select
                  required
                  value={newStandard.gender}
                  onChange={(e) => setNewStandard({...newStandard, gender: e.target.value})}
                  className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary/20 outline-none text-sm bg-white"
                >
                  <option value="boy">Boy</option>
                  <option value="girl">Girl</option>
                  <option value="unisex">Unisex</option>
                </select>
                <button
                  type="submit"
                  disabled={savingStandard || !newStandard.className}
                  className="p-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 transition-all shadow-md active:scale-95 disabled:opacity-50"
                  title="Add Class"
                >
                  <Plus size={20} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* School Form Modal */}
      {showSchoolForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-heading text-brand-secondary mb-6">
              {formData.id ? "Edit School" : "Add New School"}
            </h2>
            <form onSubmit={handleSaveSchool} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1 ml-1">School Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary/20 outline-none"
                  placeholder="Delhi Public School"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1 ml-1">Board</label>
                <select
                  required
                  value={formData.board}
                  onChange={(e) => setFormData({...formData, board: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary/20 outline-none"
                >
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="State">State</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1 ml-1">City</label>
                  <input
                    required
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary/20 outline-none"
                    placeholder="New Delhi"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1 ml-1">State</label>
                  <input
                    required
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary/20 outline-none"
                    placeholder="Delhi"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="isActive" 
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-5 h-5 accent-brand-primary"
                />
                <label htmlFor="isActive" className="text-sm font-bold text-gray-600">School is Active</label>
              </div>

              <div className="flex gap-4 pt-6">
                <button 
                  type="button"
                  onClick={() => setShowSchoolForm(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save School"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
