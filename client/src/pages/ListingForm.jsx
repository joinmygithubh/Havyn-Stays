import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, ImagePlus } from 'lucide-react';
import toast from 'react-hot-toast';

import Spinner from '../components/ui/Spinner.jsx';
import FadeImage from '../components/ui/FadeImage.jsx';
import { propertyService } from '../api/services.js';
import { PROPERTY_TYPES, AMENITIES, AMENITY_ICONS } from '../utils/constants.js';

const BLANK = {
  title: '',
  description: '',
  propertyType: 'Apartment',
  location: { city: '', state: '', country: '', lat: 0, lng: 0 },
  pricePerNight: '',
  cleaningFee: '',
  images: [''],
  amenities: [],
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  maxGuests: 2,
  instantBook: false,
};

/**
 * Create / edit listing form. When `:id` is present it loads the existing
 * listing for editing; otherwise it creates a new one. Supports multi-image
 * input via URL (Unsplash/Pexels), with live thumbnails.
 */
export default function ListingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);

  const [form, setForm] = useState(BLANK);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) return;
    (async () => {
      try {
        const { property } = await propertyService.get(id);
        setForm({
          ...BLANK,
          ...property,
          pricePerNight: property.pricePerNight,
          cleaningFee: property.cleaningFee,
          images: property.images.length ? property.images : [''],
        });
      } catch (err) {
        toast.error(err.message || 'Could not load listing');
        navigate('/host');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, editing, navigate]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setLoc = (patch) => setForm((f) => ({ ...f, location: { ...f.location, ...patch } }));

  const setImage = (i, val) =>
    setForm((f) => {
      const images = [...f.images];
      images[i] = val;
      return { ...f, images };
    });
  const addImage = () => setForm((f) => ({ ...f, images: [...f.images, ''] }));
  const removeImage = (i) => setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));

  const toggleAmenity = (a) =>
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));

  const submit = async (e) => {
    e.preventDefault();
    const images = form.images.map((s) => s.trim()).filter(Boolean);
    if (images.length < 1) return toast.error('Add at least one image URL');
    if (form.description.trim().length < 20) return toast.error('Description must be at least 20 characters');

    const payload = {
      ...form,
      images,
      pricePerNight: Number(form.pricePerNight),
      cleaningFee: Number(form.cleaningFee) || 0,
      bedrooms: Number(form.bedrooms),
      beds: Number(form.beds),
      bathrooms: Number(form.bathrooms),
      maxGuests: Number(form.maxGuests),
      location: { ...form.location, lat: Number(form.location.lat) || 0, lng: Number(form.location.lng) || 0 },
    };

    setSaving(true);
    try {
      if (editing) {
        await propertyService.update(id, payload);
        toast.success('Listing updated');
      } else {
        await propertyService.create(payload);
        toast.success('Listing published');
      }
      navigate('/host');
    } catch (err) {
      toast.error(err.message || 'Could not save listing');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-coral-500">
        <Spinner size={36} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        {editing ? 'Edit listing' : 'Create a new listing'}
      </h1>

      <form onSubmit={submit} className="mt-6 space-y-6">
        {/* Basics */}
        <Section title="The basics">
          <Field label="Title">
            <input className="input" value={form.title} onChange={(e) => set({ title: e.target.value })} required placeholder="Sunlit modern villa with pool" />
          </Field>
          <Field label="Description">
            <textarea className="input resize-none" rows={4} value={form.description} onChange={(e) => set({ description: e.target.value })} required placeholder="Describe your space, the vibe, and what makes it special…" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Property type">
              <select className="input" value={form.propertyType} onChange={(e) => set({ propertyType: e.target.value })}>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Max guests">
              <input type="number" min="1" className="input" value={form.maxGuests} onChange={(e) => set({ maxGuests: e.target.value })} />
            </Field>
          </div>
        </Section>

        {/* Location */}
        <Section title="Location">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="City"><input className="input" value={form.location.city} onChange={(e) => setLoc({ city: e.target.value })} required /></Field>
            <Field label="State / Region"><input className="input" value={form.location.state} onChange={(e) => setLoc({ state: e.target.value })} /></Field>
            <Field label="Country"><input className="input" value={form.location.country} onChange={(e) => setLoc({ country: e.target.value })} required /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Latitude (optional)"><input type="number" step="any" className="input" value={form.location.lat} onChange={(e) => setLoc({ lat: e.target.value })} /></Field>
            <Field label="Longitude (optional)"><input type="number" step="any" className="input" value={form.location.lng} onChange={(e) => setLoc({ lng: e.target.value })} /></Field>
          </div>
        </Section>

        {/* Rooms & pricing */}
        <Section title="Rooms & pricing">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Bedrooms"><input type="number" min="0" className="input" value={form.bedrooms} onChange={(e) => set({ bedrooms: e.target.value })} /></Field>
            <Field label="Beds"><input type="number" min="0" className="input" value={form.beds} onChange={(e) => set({ beds: e.target.value })} /></Field>
            <Field label="Bathrooms"><input type="number" min="0" className="input" value={form.bathrooms} onChange={(e) => set({ bathrooms: e.target.value })} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Price per night (USD)"><input type="number" min="0" className="input" value={form.pricePerNight} onChange={(e) => set({ pricePerNight: e.target.value })} required /></Field>
            <Field label="Cleaning fee (USD)"><input type="number" min="0" className="input" value={form.cleaningFee} onChange={(e) => set({ cleaningFee: e.target.value })} /></Field>
          </div>
          <label className="mt-2 flex items-center gap-3">
            <input type="checkbox" checked={form.instantBook} onChange={(e) => set({ instantBook: e.target.checked })} className="h-4 w-4 accent-coral-500" />
            <span className="font-medium">Enable Instant Book (guests can book without approval)</span>
          </label>
        </Section>

        {/* Images */}
        <Section title="Photos">
          <p className="text-sm text-ink-500">Paste image URLs from Unsplash or Pexels. The first image is the cover.</p>
          <div className="space-y-3">
            {form.images.map((url, i) => (
              <div key={i} className="flex items-center gap-3">
                {url ? (
                  <FadeImage src={url} alt={`Photo ${i + 1}`} ratio="aspect-square" className="h-14 w-14 shrink-0 rounded-lg" />
                ) : (
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-400 dark:bg-ink-700">
                    <ImagePlus size={20} />
                  </span>
                )}
                <input className="input" value={url} onChange={(e) => setImage(i, e.target.value)} placeholder="https://images.unsplash.com/…" />
                {form.images.length > 1 && (
                  <button type="button" onClick={() => removeImage(i)} className="rounded-lg p-2 text-coral-600 hover:bg-coral-50">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={addImage} className="btn-secondary mt-2 px-4 py-2 text-sm">
            <Plus size={16} /> Add another photo
          </button>
        </Section>

        {/* Amenities */}
        <Section title="Amenities">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {AMENITIES.map((a) => {
              const Icon = AMENITY_ICONS[a];
              const on = form.amenities.includes(a);
              return (
                <button
                  type="button"
                  key={a}
                  onClick={() => toggleAmenity(a)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${
                    on ? 'border-coral-500 bg-coral-50 text-coral-700 dark:bg-ink-700' : 'border-ink-200 hover:border-ink-400 dark:border-ink-700'
                  }`}
                >
                  {Icon && <Icon size={16} />} {a}
                </button>
              );
            })}
          </div>
        </Section>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Spinner size={18} /> : editing ? 'Save changes' : 'Publish listing'}
          </button>
          <button type="button" onClick={() => navigate('/host')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <fieldset className="card space-y-4 p-6">
      <legend className="text-lg font-bold">{title}</legend>
      {children}
    </fieldset>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
