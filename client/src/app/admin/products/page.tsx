/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Plus, Edit, Package, ImageIcon, Save, Download, Loader2, CheckCircle } from "lucide-react";
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

  // Variant Stock edits state
  const [stockValues, setStockValues] = useState<Record<string, number>>({});
  const [savingStockForId, setSavingStockForId] = useState<string | null>(null);

  // Image fetch states
  const [fetchingImageForId, setFetchingImageForId] = useState<string | null>(null);
  const [fetchedIds, setFetchedIds] = useState<Set<string>>(new Set());
  const [bulkFetching, setBulkFetching] = useState(false);
  const [bulkResult, setBulkResult] = useState<any | null>(null);

  // Filters
  const [filterSchool, setFilterSchool] = useState("");

  // Form states
  const [showForm, setShowForm] = useState(false);
  
  const emptyForm = {
    id: "",
    school_id: "",
    standard_id: "",
    item_type: "shirt",
    uniform_type: "regular",
    name: "",
    price: 0,
    image_url: "",
    is_active: true
  };

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [filterSchool]);

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
    const url = filterSchool ? `/admin/products?school_id=${filterSchool}` : `/admin/products`;
    const res = await api.get(url);
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
    setFormData({ ...formData, school_id: schoolId, standard_id: "" });
    loadStandards(schoolId);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return alert("Only JPG, PNG and WEBP files are allowed.");
    }

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
      setFormData(prev => ({ ...prev, image_url: res.data.imageUrl }));
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.data?.message || err.message || "Upload failed.";
      alert(`Oops! ${errorMsg}\n\nCommon fixes:\n1. Check your Cloudinary keys in Render/env\n2. Ensure the file is not corrupted`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleStockChange = (variantId: string, val: string) => {
    setStockValues(prev => ({ ...prev, [variantId]: parseInt(val) || 0 }));
  };

  const saveStock = async (variantId: string) => {
    const stock_qty = stockValues[variantId];
    if (stock_qty === undefined) return;
    
    setSavingStockForId(variantId);
    try {
      await api.patch(`/admin/variants/${variantId}/stock`, { stock_qty });
      // update local
      setItems(prevItems => prevItems.map(item => ({
        ...item,
        variants: item.variants.map((v: any) => v._id === variantId ? { ...v, stock_qty, is_available: stock_qty > 0 } : v)
      })));
    } catch (err) {
      console.error(err);
      alert("Failed to update stock");
    } finally {
      setSavingStockForId(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.standard_id) return alert("Please select a standard (class) first.");

    setSaving(true);
    try {
      const payload = {
        standard_id: formData.standard_id,
        school_id: formData.school_id,
        item_type: formData.item_type,
        uniform_type: formData.uniform_type,
        name: formData.name,
        price_paisa: formData.price * 100, // convert directly before sending
        image_url: formData.image_url,
        is_active: formData.is_active
      };

      if (formData.id) {
        await api.put(`/admin/products/${formData.id}`, payload);
      } else {
        await api.post("/admin/products", payload);
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

  const toggleProductActive = async (productId: string) => {
    try {
      const res = await api.patch(`/admin/products/${productId}/toggle`);
      setItems(prev => prev.map(p => p._id === productId ? { ...p, is_active: res.data.is_active } : p));
    } catch (err) {
      console.error("Error toggling product:", err);
      alert("Failed to update product visibility.");
    }
  };

  const handleFetchImages = async (productId: string) => {
    setFetchingImageForId(productId);
    try {
      const res = await api.post(`/admin/products/${productId}/fetch-images`, { imageCount: 4 });
      // Update local state with new images
      setItems(prev => prev.map(p => 
        p._id === productId 
          ? { ...p, images: res.data.images, primary_image: res.data.images[0]?.url, image_url: res.data.images[0]?.url }
          : p
      ));
      setFetchedIds(prev => new Set(prev).add(productId));
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to fetch images. Check Unsplash/Cloudinary config.");
    } finally {
      setFetchingImageForId(null);
    }
  };

  const handleBulkFetchImages = async () => {
    if (!filterSchool) return alert("Please select a school first to bulk fetch images.");
    if (!window.confirm('This will fetch images for all products in this school that don\'t have images yet. This may take several minutes. Continue?')) return;
    
    setBulkFetching(true);
    setBulkResult(null);
    try {
      const res = await api.post(`/admin/schools/${filterSchool}/fetch-all-images`);
      setBulkResult(res.data);
      fetchItems(); // reload
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Bulk image fetch failed.");
    } finally {
      setBulkFetching(false);
    }
  };

  const openAddForm = () => {
    setFormData(emptyForm);
    setStandards([]);
    setShowForm(true);
  };

  const openEditForm = async (item: any) => {
    const schoolId = item.school_id._id;
    await loadStandards(schoolId);

    setFormData({
      id: item._id,
      school_id: schoolId,
      standard_id: item.standard_id._id,
      item_type: item.item_type,
      uniform_type: item.uniform_type,
      name: item.name,
      price: item.price_paisa / 100, // retrieve to rupees
      image_url: item.image_url || "",
      is_active: item.is_active
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
          <Plus size={20} /> Add Product
        </button>
      </div>

      {/* Catalog Filter Controls */}
      <div className="bg-white rounded-t-3xl p-6 border-b border-gray-100 flex items-center gap-4">
        <label className="text-sm font-bold text-gray-500">Filter By School:</label>
        <select 
          className="p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm"
          value={filterSchool}
          onChange={(e) => setFilterSchool(e.target.value)}
        >
          <option value="">All Schools</option>
          {schools.map(sch => (
            <option key={sch._id} value={sch._id}>{sch.name}</option>
          ))}
        </select>
        {filterSchool && (
          <button
            onClick={handleBulkFetchImages}
            disabled={bulkFetching}
            className="ml-auto bg-brand-accent text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-brand-accent/90 transition-all disabled:opacity-50"
          >
            {bulkFetching ? (
              <><Loader2 size={16} className="animate-spin" /> Fetching all images...</>
            ) : (
              <><Download size={16} /> Fetch All Images</>
            )}
          </button>
        )}
      </div>
      {bulkResult && (
        <div className="bg-brand-bg/50 border border-brand-primary/10 rounded-2xl p-4 mx-6 -mt-2 mb-4 text-sm">
          <p className="font-bold text-brand-secondary">
            Bulk Fetch Complete: {bulkResult.success_count} succeeded, {bulkResult.failed_count} failed out of {bulkResult.total}
          </p>
          {bulkResult.failed?.length > 0 && (
            <p className="text-gray-500 mt-1">Failed: {bulkResult.failed.join(', ')}</p>
          )}
        </div>
      )}

      <div className="bg-white rounded-b-3xl p-6 shadow-sm border border-t-0 border-gray-100 min-h-[400px]">
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
              description="No uniform items found matching the current criteria." 
              action={{ label: "Add Item", href: "#" }}
              onClick={openAddForm}
            />
          </div>
        ) : (
          <div className="overflow-x-auto pb-32">
            <table className="w-full text-left">
              <thead className="text-sm text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="pb-4 font-normal">Item</th>
                  <th className="pb-4 font-normal">Type</th>
                  <th className="pb-4 font-normal hidden md:table-cell">Standard / School</th>
                  <th className="pb-4 font-normal">Price</th>
                  <th className="pb-4 font-normal">Variant Stock Control</th>
                  <th className="pb-4 font-normal">Status</th>
                  <th className="pb-4 font-normal text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {items.map((item) => (
                  <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors align-top">
                    <td className="py-4 font-bold text-brand-secondary">
                      <div className="flex items-start gap-3">
                        {(item.primary_image || item.image_url) ? (
                          <div className="relative">
                            <img src={item.primary_image || item.image_url} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                            {item.images?.length > 0 && (
                              <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-primary text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                                {item.images.length}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400"><ImageIcon size={16}/></div>
                        )}
                        <span className="mt-1">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-gray-500 capitalize">{item.item_type} <br/><span className="text-[10px] bg-brand-bg text-brand-primary px-2 py-1 rounded-md mt-1 inline-block">{item.uniform_type}</span></td>
                    <td className="py-4 text-gray-500 hidden md:table-cell">
                      {item.standard_id?.class_name} ({item.standard_id?.gender}) <br/>
                      <span className="text-[10px] text-gray-400">{item.school_id?.name}</span>
                    </td>
                    <td className="py-4 font-bold text-brand-secondary">₹{item.price_paisa / 100}</td>
                    
                    {/* Compact Variant Stock Controls */}
                    <td className="py-4">
                      <div className="flex flex-wrap gap-2 max-w-[280px]">
                        {item.variants && item.variants.map((v: any) => (
                          <div key={v._id} className="flex flex-col items-center gap-1 border border-gray-100 p-1 rounded bg-white">
                            <span className="text-[10px] font-bold text-gray-400">{v.size}</span>
                            <div className="flex items-center">
                              <input 
                                type="number" 
                                min="0"
                                className="w-10 text-center text-xs p-1 border-gray-200 outline-none rounded bg-gray-50 focus:bg-white focus:ring-1 ring-brand-primary"
                                value={stockValues[v._id] ?? v.stock_qty}
                                onChange={(e) => handleStockChange(v._id, e.target.value)}
                              />
                            </div>
                            {stockValues[v._id] !== undefined && stockValues[v._id] !== v.stock_qty && (
                              <button 
                                onClick={() => saveStock(v._id)}
                                disabled={savingStockForId === v._id}
                                className="text-[9px] bg-brand-accent text-white px-1 py-0.5 rounded w-full flex items-center justify-center disabled:opacity-50"
                              >
                                {savingStockForId === v._id ? '...' : 'Save'}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="py-4">
                      <button
                        onClick={() => toggleProductActive(item._id)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-opacity hover:opacity-80 ${
                          item.is_active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {item.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-4 text-right flex justify-end gap-2">
                      <button
                        onClick={() => handleFetchImages(item._id)}
                        disabled={fetchingImageForId === item._id || fetchedIds.has(item._id)}
                        title="Fetch images from Unsplash"
                        className={`p-2 rounded-full inline-flex transition-colors cursor-pointer text-sm font-bold ${
                          fetchedIds.has(item._id)
                            ? 'text-emerald-500 bg-emerald-50'
                            : fetchingImageForId === item._id
                              ? 'text-brand-accent bg-brand-accent/10'
                              : 'text-brand-accent hover:bg-brand-accent/10'
                        }`}
                      >
                        {fetchingImageForId === item._id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : fetchedIds.has(item._id) ? (
                          <CheckCircle size={16} />
                        ) : (
                          <Download size={16} />
                        )}
                      </button>
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
                {formData.id ? "Edit Uniform Product" : "Add Uniform Product"}
              </h2>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              
              {/* Location selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-brand-bg/30 p-4 rounded-2xl border border-brand-primary/5">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-400 mb-2 ml-1">Select School</label>
                  <select
                    required
                    value={formData.school_id}
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
                    value={formData.standard_id}
                    onChange={(e) => setFormData({...formData, standard_id: e.target.value})}
                    disabled={loadingStandards || !formData.school_id}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary/20 outline-none shadow-sm disabled:opacity-50"
                  >
                    <option value="" disabled>
                      {loadingStandards 
                        ? "Fetching classes..." 
                        : !formData.school_id 
                          ? "-- Select School First --" 
                          : standards.length === 0 
                            ? "No classes found for this school" 
                            : "-- Select Standard --"}
                    </option>
                    {standards.map(std => (
                      <option key={std._id} value={std._id}>{std.class_name} ({std.gender})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Item Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2 ml-1">Product Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                    value={formData.item_type}
                    onChange={(e) => setFormData({...formData, item_type: e.target.value})}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary/20 outline-none"
                  >
                    <option value="shirt">Shirt / Top</option>
                    <option value="pant">Pant / Trousers</option>
                    <option value="skirt">Skirt / Tunic</option>
                    <option value="shorts">Shorts</option>
                    <option value="blazer">Blazer / Sweater</option>
                    <option value="shoes">Shoes</option>
                    <option value="socks">Socks</option>
                    <option value="accessories">Accessories / Tie / Belt</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2 ml-1">Uniform Category</label>
                  <select
                    required
                    value={formData.uniform_type}
                    onChange={(e) => setFormData({...formData, uniform_type: e.target.value})}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary/20 outline-none"
                  >
                    <option value="regular">Regular</option>
                    <option value="sports">Sports</option>
                    <option value="house">House uniform</option>
                  </select>
                </div>
              </div>

              {/* Cloudinary Image Upload */}
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  {formData.image_url ? (
                    <img src={formData.image_url} alt="Preview" className="w-32 h-32 object-cover rounded-xl shadow-md" />
                  ) : (
                    <div className="w-32 h-32 bg-white rounded-xl flex flex-col items-center justify-center text-gray-400 shadow-sm">
                      <ImageIcon size={32} className="mb-2" />
                      <span className="text-xs">No Image</span>
                    </div>
                  )}
                </div>
                
                <div className="text-left">
                  <h3 className="text-sm font-bold text-brand-secondary mb-2">Item Image</h3>
                  <label className="bg-white border border-gray-200 text-brand-primary px-4 py-2 rounded-xl text-sm font-bold cursor-pointer hover:bg-gray-50 transition-colors inline-block relative">
                    {uploadingImage ? "Uploading to Cloudinary..." : "Select Image File"}
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                  </label>
                  <p className="text-xs text-gray-400 mt-2">Max 5MB (JPG, PNG, WEBP).<br/>Square aspect ratio recommended.</p>
                </div>
              </div>

              {!formData.id && (
                <div className="bg-brand-accent/5 border border-brand-accent/20 p-4 rounded-xl text-xs text-brand-secondary">
                  <strong>Note:</strong> Standard size variants (S, M, L, etc. or shoe sizes) will be automatically generated upon creation. You can set stock quantities from the catalog list afterwards.
                </div>
              )}
              
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100 mt-6">
                <input 
                  type="checkbox" 
                  id="isActive" 
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
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
                  {saving ? "Saving Data..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
