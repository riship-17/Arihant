/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Plus, Edit, Package, ImageIcon } from "lucide-react";
import { InlineSpinner } from "@/components/PageSpinner";
import ErrorBanner from "@/components/ErrorBanner";
import EmptyState from "@/components/EmptyState";

export default function AdminProducts() {
  const [items, setItems] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [standards, setStandards] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loadingStandards, setLoadingStandards] = useState(false);

  // Form states
  const [showForm, setShowForm] = useState(false);
  
  const emptyForm = {
    id: "",
    schoolId: "",
    standard: "",
    itemType: "shirt",
    uniformType: "regular",
    itemName: "",
    description: "",
    price: 0,
    imageUrl: "",
    sizes: [
      { size: "S", stock: 0 },
      { size: "M", stock: 0 },
      { size: "L", stock: 0 },
      { size: "XL", stock: 0 },
      { size: "XXL", stock: 0 },
    ],
    isActive: true
  };

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchItems(), fetchSchools()]);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load catalog data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    const res = await api.get("/uniform-items");
    setItems(res.data);
  };

  const fetchSchools = async () => {
    const res = await api.get("/schools");
    setSchools(res.data);
  };

  const loadStandards = async (schoolId: string) => {
    if (!schoolId) {
      setStandards([]);
      return;
    }
    setLoadingStandards(true);
    try {
      const res = await api.get(`/standards?school=${schoolId}`);
      setStandards(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load classes for this school");
    } finally {
      setLoadingStandards(false);
    }
  };

  const handleSchoolChange = (schoolId: string) => {
    setFormData({ ...formData, schoolId, standard: "" });
    loadStandards(schoolId);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return alert("File is larger than 5MB max length.");
    }

    const payload = new FormData();
    payload.append("image", file);

    setUploadingImage(true);
    try {
      const res = await api.post("/admin/upload-image", payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setFormData(prev => ({ ...prev, imageUrl: res.data.imageUrl }));
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to upload image. Please ensure Cloudinary is configured.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSizeChange = (idx: number, stockVal: number) => {
    const newSizes = [...formData.sizes];
    newSizes[idx].stock = stockVal;
    setFormData({ ...formData, sizes: newSizes });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.standard) return alert("Please select a standard (class) first.");

    setSaving(true);
    try {
      const payload = {
        standard: formData.standard,
        itemType: formData.itemType,
        uniformType: formData.uniformType,
        itemName: formData.itemName,
        description: formData.description,
        price: Number(formData.price),
        imageUrl: formData.imageUrl,
        sizes: formData.sizes,
        isActive: formData.isActive
      };

      if (formData.id) {
        await api.put(`/uniform-items/${formData.id}`, payload);
      } else {
        await api.post("/uniform-items", payload);
      }
      
      setShowForm(false);
      fetchItems();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save item");
    } finally {
      setSaving(false);
    }
  };

  const openAddForm = () => {
    setFormData(emptyForm);
    setStandards([]);
    setShowForm(true);
  };

  const openEditForm = async (item: any) => {
    const schoolId = item.standard?.school?._id || item.standard?.school;
    await loadStandards(schoolId);

    const formSizes = emptyForm.sizes.map(defaultSize => {
      const existing = item.sizes.find((s: any) => s.size === defaultSize.size);
      return existing ? { ...existing } : defaultSize;
    });

    setFormData({
      id: item._id,
      schoolId: schoolId,
      standard: item.standard?._id || item.standard,
      itemType: item.itemType,
      uniformType: item.uniformType || 'regular',
      itemName: item.itemName,
      description: item.description || "",
      price: item.price,
      imageUrl: item.imageUrl || "",
      sizes: formSizes,
      isActive: item.isActive
    });

    setShowForm(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-heading text-brand-secondary">Uniform Catalogue</h1>
        <button 
          onClick={openAddForm}
          className="bg-brand-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-primary/90 transition-all shadow-md shadow-brand-primary/20"
        >
          <Plus size={20} /> Add Item
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 min-h-[400px]">
        {loading ? (
          <div className="py-20">
            <InlineSpinner message="Loading catalog..." />
          </div>
        ) : error ? (
          <div className="py-10">
            <ErrorBanner type="server" message={error} onRetry={loadInitialData} />
          </div>
        ) : items.length === 0 ? (
          <div className="py-10">
            <EmptyState 
              icon={Package} 
              title="Catalogue is Empty" 
              description="You haven't added any uniform items yet. Start by clicking the 'Add Item' button." 
              action={{ label: "Add Your First Item", href: "#" }}
              onClick={openAddForm}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-sm text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="pb-4 font-normal">Item</th>
                  <th className="pb-4 font-normal">Type</th>
                  <th className="pb-4 font-normal hidden md:table-cell">Standard / School</th>
                  <th className="pb-4 font-normal">Price</th>
                  <th className="pb-4 font-normal">Status</th>
                  <th className="pb-4 font-normal text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {items.map((item) => (
                  <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-4 font-bold text-brand-secondary flex items-center gap-3">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.itemName} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400"><ImageIcon size={16}/></div>
                      )}
                      <span>{item.itemName}</span>
                    </td>
                    <td className="py-4 text-gray-500 capitalize">{item.itemType} <span className="text-[10px] bg-brand-bg text-brand-primary px-2 py-1 rounded-md ml-1">{item.uniformType}</span></td>
                    <td className="py-4 text-gray-500 hidden md:table-cell">
                      {item.standard?.className} ({item.standard?.gender}) <br/>
                      <span className="text-[10px] text-gray-400">{item.standard?.school?.name}</span>
                    </td>
                    <td className="py-4 font-bold text-brand-secondary">₹{item.price}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        item.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 text-right flex justify-end gap-2">
                      <button
                        onClick={() => openEditForm(item)}
                        className="text-brand-primary hover:bg-brand-primary/10 p-2 rounded-full inline-flex transition-colors cursor-pointer"
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

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-heading text-brand-secondary flex items-center gap-2">
                <Package size={20} className="text-brand-primary" />
                {formData.id ? "Edit Uniform Item" : "Add Uniform Item"}
              </h2>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              
              {/* Location selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-brand-bg/30 p-4 rounded-2xl border border-brand-primary/5">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-400 mb-2 ml-1">Select School</label>
                  <select
                    required
                    value={formData.schoolId}
                    onChange={(e) => handleSchoolChange(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary/20 outline-none shadow-sm"
                  >
                    <option value="" disabled>-- Select School --</option>
                    {schools.map(sch => (
                      <option key={sch._id} value={sch._id}>{sch.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-400 mb-2 ml-1">Select Standard (Class)</label>
                  <select
                    required
                    value={formData.standard}
                    onChange={(e) => setFormData({...formData, standard: e.target.value})}
                    disabled={loadingStandards || !formData.schoolId}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary/20 outline-none shadow-sm disabled:opacity-50"
                  >
                    <option value="" disabled>
                      {loadingStandards 
                        ? "Fetching classes..." 
                        : !formData.schoolId 
                          ? "-- Select School First --" 
                          : standards.length === 0 
                            ? "No classes found for this school" 
                            : "-- Select Standard --"}
                    </option>
                    {standards.map(std => (
                      <option key={std._id} value={std._id}>{std.className} ({std.gender})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Item Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2 ml-1">Item Name</label>
                  <input
                    required
                    type="text"
                    value={formData.itemName}
                    onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary/20 outline-none"
                    placeholder="e.g. Summer Shirt Half Sleeve"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2 ml-1">Price (₹)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary/20 outline-none"
                    placeholder="599"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2 ml-1">Physical Item Type</label>
                  <select
                    required
                    value={formData.itemType}
                    onChange={(e) => setFormData({...formData, itemType: e.target.value})}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary/20 outline-none"
                  >
                    <option value="shirt">Shirt</option>
                    <option value="pant">Pant / Trousers</option>
                    <option value="skirt">Skirt / Tunic</option>
                    <option value="shorts">Shorts</option>
                    <option value="blazer">Blazer / Sweater</option>
                    <option value="tie">Tie</option>
                    <option value="belt">Belt</option>
                    <option value="socks">Socks</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2 ml-1">Uniform Category</label>
                  <select
                    required
                    value={formData.uniformType}
                    onChange={(e) => setFormData({...formData, uniformType: e.target.value})}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary/20 outline-none"
                  >
                    <option value="regular">Regular</option>
                    <option value="sports">Sports</option>
                    <option value="house">House uniform</option>
                  </select>
                </div>
              </div>

              {/* Cloudinary Image Upload */}
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center">
                <div className="mb-4">
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="Preview" className="w-32 h-32 object-cover mx-auto rounded-xl shadow-md" />
                  ) : (
                    <div className="w-16 h-16 bg-white rounded-xl mx-auto flex items-center justify-center text-gray-400 shadow-sm">
                      <ImageIcon size={24} />
                    </div>
                  )}
                </div>
                
                <h3 className="text-sm font-bold text-brand-secondary mb-2">Item Image</h3>
                <label className="bg-white border border-gray-200 text-brand-primary px-4 py-2 rounded-xl text-sm font-bold cursor-pointer hover:bg-gray-50 transition-colors inline-block relative">
                  {uploadingImage ? "Uploading to Cloudinary..." : "Select File"}
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                </label>
                <p className="text-xs text-gray-400 mt-2">Max 5MB (JPG, PNG, WEBP)</p>
              </div>

              {/* Stock Matrix */}
              <div>
                <h3 className="text-sm font-bold text-brand-secondary mb-3">Inventory Stock Matrix</h3>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {formData.sizes.map((s, idx) => (
                    <div key={s.size} className="bg-gray-50 p-4 rounded-xl flex-1 text-center min-w-[80px]">
                      <div className="text-xs font-bold text-brand-primary bg-brand-primary/10 rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">
                        {s.size}
                      </div>
                      <input 
                        type="number"
                        min="0"
                        value={s.stock}
                        onChange={(e) => handleSizeChange(idx, Number(e.target.value))}
                        className="w-full text-center p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-primary/20 outline-none font-bold text-brand-secondary"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100 mt-6">
                <input 
                  type="checkbox" 
                  id="isActive" 
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-5 h-5 accent-brand-primary"
                />
                <label htmlFor="isActive" className="text-sm font-bold text-brand-secondary">Item is Active & Visible</label>
                <p className="text-xs text-gray-400 ml-2">(Uncheck instead of deleting old items to preserve order history)</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <button 
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="flex-1 py-4 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving Data..." : "Save Finished Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
