import React, { useEffect, useState } from "react";
import {
  getCart as apiGetCart,
  updateCart as apiUpdateCart,
} from "../services/cartService";
import { createOrder } from "../services/orderService";
import { getMyAddresses, addMyAddress, updateMyAddress, deleteMyAddress } from '../services/userService';
import ConfirmModal from './ConfirmModal';
import toast from "react-hot-toast";

export default function CartSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const [items, setItems] = useState([]);
  const [mode, setMode] = useState('cart'); // 'cart' | 'address'

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: '', name: '', line1: '', line2: '', city: '', state: '', country: '', postalCode: '', phone: '', isDefault: false });
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [editAddr, setEditAddr] = useState(null);
  const [confirm, setConfirm] = useState({ open: false });

  const loadFromLocal = () => { try { const c = JSON.parse(localStorage.getItem("cart") || "[]"); setItems(c); } catch (e) { setItems([]); } };

  useEffect(() => {
    loadFromLocal();
    const onToggle = (e) => { const open = e?.detail?.open ?? !isOpen; if (open) { setMounted(true); setClosing(false); setIsOpen(true); loadFromLocal(); setMode('cart'); } else { setClosing(true); setIsOpen(false); setTimeout(() => { setMounted(false); setClosing(false); }, 300); } };
    const onUpdated = () => loadFromLocal();
    window.addEventListener("cart:toggle", onToggle);
    window.addEventListener("cart:updated", onUpdated);

    const user = localStorage.getItem("user"); const token = localStorage.getItem("token");
    if (user && token) {
      apiGetCart().then((serverCart) => { if (Array.isArray(serverCart) && serverCart.length > 0) { const mapped = serverCart.map((i) => ({ productId: i.product._id, product: i.product.product, image: i.product.images?.[0] || "", size: i.size || '', quantity: i.qty ?? i.quantity ?? 1, price: i.price ?? i.product.discountedPrice ?? 0, originalPrice: i.originalPrice ?? i.product.mrp ?? null, discountPercent: i.discountPercent ?? 0 })); setItems(mapped); localStorage.setItem("cart", JSON.stringify(mapped)); } }).catch(()=>{});
    }

    return () => { window.removeEventListener("cart:toggle", onToggle); window.removeEventListener("cart:updated", onUpdated); };
  }, []);

  const subtotal = items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 0), 0);

  const syncToServer = async (next) => { const user = localStorage.getItem("user"); const token = localStorage.getItem("token"); if (user && token) { try { await apiUpdateCart(next); } catch (e) { console.error("sync cart failed", e); } } };

  const updateQty = (productId, size, qty) => { const next = items.map((it) => (it.productId === productId && it.size === size ? { ...it, quantity: qty } : it)).filter((i) => i.quantity > 0); setItems(next); localStorage.setItem("cart", JSON.stringify(next)); window.dispatchEvent(new Event("cart:updated")); syncToServer(next); };

  const updateSize = (productId, oldSize, newSize) => { if (oldSize === newSize) return; let next = [...items]; const idx = next.findIndex((it) => it.productId === productId && it.size === oldSize); if (idx === -1) return; const existingIdx = next.findIndex((it) => it.productId === productId && it.size === newSize); if (existingIdx !== -1) { next[existingIdx] = { ...next[existingIdx], quantity: (next[existingIdx].quantity || 0) + (next[idx].quantity || 0) }; next.splice(idx, 1); } else { next[idx] = { ...next[idx], size: newSize }; } setItems(next); localStorage.setItem("cart", JSON.stringify(next)); window.dispatchEvent(new Event("cart:updated")); syncToServer(next.map((i) => ({ product: i.productId, qty: i.quantity, size: i.size, price: i.price }))); };

  const removeItem = (productId, size) => { const next = items.filter((it) => !(it.productId === productId && it.size === size)); setItems(next); localStorage.setItem("cart", JSON.stringify(next)); window.dispatchEvent(new Event("cart:updated")); syncToServer(next); toast.success("Removed from cart"); };

  const loadAddresses = async () => { try { const list = await getMyAddresses(); setAddresses(list || []); if ((list || []).length && !selectedAddressId) setSelectedAddressId(list[0]._id); } catch (e) { console.error('could not load addresses', e); setAddresses([]); } };

  const handleAddAddress = async () => { try { await addMyAddress(newAddr); setNewAddr({ label: '', name: '', line1: '', line2: '', city: '', state: '', country: '', postalCode: '', phone: '', isDefault: false }); setAdding(false); await loadAddresses(); toast.success('Address added'); } catch (e) { toast.error('Could not add address'); } };

  const placeOrderWithAddress = async (addr) => { if (!addr) return toast.error('Select an address'); const user = localStorage.getItem('user'); const token = localStorage.getItem('token'); if (!user || !token) { try { window.dispatchEvent(new CustomEvent('signup:toggle', { detail: { open: true } })); } catch(e){}; return; } try { await apiUpdateCart(items.map((i) => ({ product: i.productId, qty: i.quantity, size: i.size, price: i.price }))); const order = await createOrder({ items: items.map(i => ({ product: i.productId, quantity: i.quantity, size: i.size })), shippingAddress: addr, paymentMethod: 'dummy' }); toast.success('Order placed (dummy) — ' + (order._id || '')); setItems([]); localStorage.setItem('cart', JSON.stringify([])); syncToServer([]); setClosing(true); setIsOpen(false); setTimeout(() => setMounted(false), 300); } catch (err) { console.error(err); toast.error('Could not place order'); } };

  return (
    <>
      {mounted && (
        <>
          <div className="fixed inset-0 bg-black/40 font-bdogrotesk z-[10000]" onClick={() => { setClosing(true); setIsOpen(false); setTimeout(() => setMounted(false), 300); }} />

          <div className={`fixed top-0 right-0 bottom-0 w-full max-w-lg bg-white z-[10001] shadow-2xl flex flex-col drawer-panel ${closing ? 'drawer-slide-out' : 'drawer-slide-in'}`}>
            <div className="p-2 border-b flex items-center justify-between">
              <h3 className="text-base text-black font-bdogrotesk">{mode === 'cart' ? 'Cart' : 'Shipping address'} <span className="text-base font-bdogrotesk text-black">{mode === 'cart' ? items.length : addresses.length}</span></h3>
              <button onClick={() => { setClosing(true); setIsOpen(false); setTimeout(() => setMounted(false), 300); }} className="text-base text-black font-bdogrotesk">Close</button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              {mode === 'cart' ? (
                items.length === 0 ? (
                  <div className="text-center text-gray-500 py-16">Your cart is empty</div>
                ) : (
                  <div className="space-y-6">
                    {items.map((it) => (
                      <div key={`${it.productId}-${it.size}`}>
                        <div className="flex gap-4 items-start">
                          <div className="w-40 h-48 bg-gray-100 flex-shrink-0 overflow-hidden">{it.image ? <img src={it.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>}</div>
                          <div className="flex-1 flex flex-col min-h-[12rem]">
                            <div className="flex justify-between items-start">
                              <div className="max-w-[220px]">
                                <div className="font-medium font-bdogrotesk text-base">{it.product}</div>
                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">{["XXS","XS","S","M","L","XL","XXL","Custom"].map(sz => (<button key={sz} onClick={() => updateSize(it.productId, it.size, sz)} className={`text-sm ${it.size===sz ? 'font-semibold text-black border-b-2 border-solid border-black' : 'text-gray-400'}`}>{sz}</button>))}</div>
                                <div className="flex items-center gap-3 mt-4"><div className="flex items-center border-2 border-black"><button onClick={() => updateQty(it.productId, it.size, Math.max(0, (it.quantity || 1)-1))} className="px-3 py-1 text-sm">-</button><div className="px-5 text-sm">{it.quantity}</div><button onClick={() => updateQty(it.productId, it.size, (it.quantity || 1)+1)} className="px-3 py-1 text-sm">+</button></div><button onClick={() => removeItem(it.productId, it.size)} className="px-4 py-1 border-2 font-bdogrotesk border-solid border-black text-sm">Remove</button></div>
                              </div>
                              <div className="text-sm font-semibold pr-3 text-right shrink-0">₹{(it.price||0)*(it.quantity||0)}</div>
                            </div>
                            <div className="mt-auto flex items-end gap-2 pb-1"><div className="text-sm text-gray-400 line-through">₹{Math.round((it.originalPrice ?? Math.round((it.price||0)*1.5))*(it.quantity||0))}</div><div className="text-sm font-semibold">₹{(it.price||0)*(it.quantity||0)} <span className="text-red-500 text-xs">({it.discountPercent ?? 0}% Off)</span></div></div>
                          </div>
                        </div>
                        <hr className="my-4 border-black" />
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between"><button className="text-sm text-gray-600" onClick={() => setMode('cart')}>← Back to cart</button><div className="text-sm font-medium">Select shipping address</div></div>
                  {(addresses || []).length === 0 ? <div className="text-gray-500">No saved addresses</div> : (
                    <div className="space-y-3">
                      {addresses.map(a => (
                        <div key={a._id} className="border p-3 rounded">
                          {editingAddressId === String(a._id) ? (
                            <div className="space-y-2">
                              <input className="w-full p-2 border" value={editAddr.label || ''} onChange={e => setEditAddr({...editAddr, label: e.target.value})} placeholder="Label" />
                              <input className="w-full p-2 border" value={editAddr.name || ''} onChange={e => setEditAddr({...editAddr, name: e.target.value})} placeholder="Full name" />
                              <input className="w-full p-2 border" value={editAddr.line1 || ''} onChange={e => setEditAddr({...editAddr, line1: e.target.value})} placeholder="Address line 1" />
                              <input className="w-full p-2 border" value={editAddr.line2 || ''} onChange={e => setEditAddr({...editAddr, line2: e.target.value})} placeholder="Address line 2" />
                              <div className="grid grid-cols-2 gap-2">
                                <input className="p-2 border" value={editAddr.city || ''} onChange={e => setEditAddr({...editAddr, city: e.target.value})} placeholder="City" />
                                <input className="p-2 border" value={editAddr.postalCode || ''} onChange={e => setEditAddr({...editAddr, postalCode: e.target.value})} placeholder="Postal code" />
                              </div>
                              <input className="w-full p-2 border" value={editAddr.phone || ''} onChange={e => setEditAddr({...editAddr, phone: e.target.value})} placeholder="Phone" />
                              <div className="flex gap-2">
                                <button className="px-3 py-2 bg-black text-white" onClick={async () => {
                                  try { await updateMyAddress(a._id, editAddr); await loadAddresses(); setEditingAddressId(null); toast.success('Address updated'); } catch (e) { toast.error('Could not update address'); }
                                }}>Save</button>
                                <button className="px-3 py-2 border" onClick={() => { setEditingAddressId(null); setEditAddr(null); }}>Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start gap-3">
                              <input type="radio" name="selAddr" checked={String(selectedAddressId)===String(a._id)} onChange={() => setSelectedAddressId(a._id)} />
                              <div className="flex-1">
                                <div className="font-medium">{a.label || a.name}</div>
                                <div className="text-sm text-gray-600">{a.line1}{a.line2?(', '+a.line2):''}, {a.city} {a.postalCode}</div>
                                <div className="text-sm text-gray-600">{a.phone}</div>
                              </div>
                              <div className="flex gap-2">
                                <button className="px-2 py-1 border text-sm" onClick={() => { setEditingAddressId(String(a._id)); setEditAddr({ label: a.label, name: a.name, line1: a.line1, line2: a.line2, city: a.city, state: a.state, country: a.country, postalCode: a.postalCode, phone: a.phone, isDefault: !!a.isDefault }); }}>Edit</button>
                                <button className="px-2 py-1 border text-sm text-red-600" onClick={() => {
                                  setConfirm({
                                    open: true,
                                    title: 'Confirm Delete',
                                    description: 'Are you sure you want to delete this address?',
                                    onConfirm: async () => {
                                      try {
                                        await deleteMyAddress(a._id);
                                        await loadAddresses();
                                        toast.success('Address deleted');
                                      } catch (e) {
                                        toast.error('Could not delete address');
                                      } finally {
                                        setConfirm(c => ({ ...c, open: false }));
                                      }
                                    },
                                    onCancel: () => setConfirm(c => ({ ...c, open: false }))
                                  });
                                }}>Delete</button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {adding ? (<div className="space-y-2 border p-3 rounded"><input value={newAddr.label} onChange={e=>setNewAddr({...newAddr,label:e.target.value})} placeholder="Label (Home, Work)" className="w-full p-2 border" /><input value={newAddr.name} onChange={e=>setNewAddr({...newAddr,name:e.target.value})} placeholder="Full name" className="w-full p-2 border" /><input value={newAddr.line1} onChange={e=>setNewAddr({...newAddr,line1:e.target.value})} placeholder="Address line 1" className="w-full p-2 border" /><input value={newAddr.line2} onChange={e=>setNewAddr({...newAddr,line2:e.target.value})} placeholder="Address line 2" className="w-full p-2 border" /><div className="grid grid-cols-2 gap-2"><input value={newAddr.city} onChange={e=>setNewAddr({...newAddr,city:e.target.value})} placeholder="City" className="p-2 border" /><input value={newAddr.postalCode} onChange={e=>setNewAddr({...newAddr,postalCode:e.target.value})} placeholder="Postal code" className="p-2 border" /></div><input value={newAddr.phone} onChange={e=>setNewAddr({...newAddr,phone:e.target.value})} placeholder="Phone" className="w-full p-2 border" /><div className="flex gap-2"><button onClick={handleAddAddress} className="px-3 py-2 bg-black text-white">Save</button><button onClick={()=>{ setAdding(false); setNewAddr({ label: '', name: '', line1: '', line2: '', city: '', state: '', country: '', postalCode: '', phone: '', isDefault: false }); }} className="px-3 py-2 border">Cancel</button></div></div>) : (<button onClick={() => { setAdding(true); }} className="px-3 py-2 border">Add new address</button>)}
                </div>
              )}
            </div>

            <div className="p-4 border-t">
              {mode === 'cart' ? (
                <>
                  <div className="mb-4"><div className="text-sm font-medium">Discount Code</div></div>
                  <div className="flex items-center justify-between mb-3"><div className="text-sm font-medium">Subtotal <span className="text-gray-500">{items.length}</span></div><div className="font-semibold">₹{subtotal}</div></div>
                  <button onClick={async () => { if(items.length===0) return; await loadAddresses(); setMode('address'); }} disabled={items.length===0} className="w-full bg-black text-white py-3">Continue to Checkout</button>
                </>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => { const addr = addresses.find(a => String(a._id)===String(selectedAddressId)); placeOrderWithAddress(addr); }} className="flex-1 bg-black text-white py-3">Use this address & Pay (dummy)</button>
                  <button onClick={() => setMode('cart')} className="flex-1 border py-3">Back</button>
                </div>
              )}
            </div>
            {confirm?.open && (
              <ConfirmModal open={confirm.open} title={confirm.title} description={confirm.description} onConfirm={confirm.onConfirm} onCancel={confirm.onCancel} />
            )}
          </div>
        </>
      )}
    </>
  );
}
