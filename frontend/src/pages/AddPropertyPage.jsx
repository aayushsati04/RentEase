import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const STEPS = [
  { id: 1, name: 'Basic Info' },
  { id: 2, name: 'Location' },
  { id: 3, name: 'Details & Rent' },
  { id: 4, name: 'Amenities' }
];

export default function AddPropertyPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Apartment');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('');
  const [securityDeposit, setSecurityDeposit] = useState('');
  const [area, setArea] = useState('');
  const [bedrooms, setBedrooms] = useState('2');
  const [bathrooms, setBathrooms] = useState('2');
  const [amenities, setAmenities] = useState([]);

  const toggleAmenity = (name) => {
    if (amenities.includes(name)) {
      setAmenities(amenities.filter(a => a !== name));
    } else {
      setAmenities([...amenities, name]);
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (currentStep === 1 && (!title.trim() || !description.trim())) {
      toast.error('Please fill in basic details');
      return;
    }
    if (currentStep === 2 && (!city.trim() || !address.trim())) {
      toast.error('Please fill in location details');
      return;
    }
    if (currentStep === 3 && (!price || !securityDeposit || !area)) {
      toast.error('Please fill in pricing and sizing specifications');
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Listing created successfully! Awaiting validation.');
    setTimeout(() => {
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Step progress bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            {STEPS.map((step) => (
              <div key={step.id} className="flex flex-col items-center flex-1 relative">
                {/* Connector line */}
                {step.id > 1 && (
                  <div className={`absolute top-4 -left-1/2 right-1/2 h-0.5 z-0 ${
                    currentStep >= step.id ? 'bg-gradient-to-r from-primary-500 to-violet-500' : 'bg-slate-800'
                  }`} />
                )}
                {/* Dot */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs z-10 border transition-all ${
                  currentStep >= step.id 
                    ? 'bg-gradient-to-br from-primary-500 to-violet-600 text-white border-primary-400 shadow-glow-sm' 
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}>
                  {step.id}
                </div>
                <span className={`text-[10px] sm:text-xs font-semibold mt-2.5 transition-all ${
                  currentStep >= step.id ? 'text-white' : 'text-slate-600'
                }`}>
                  {step.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Form Wrapper */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/8 shadow-glass">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
            >
              
              {/* STEP 1: BASIC INFO */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Let's start with basic info</h2>
                    <p className="text-slate-500 text-xs">Enter details about what kind of listing you want to create.</p>
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Listing Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Modern Sea-Facing 2BHK Apartment"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Space Description</label>
                    <textarea 
                      rows={5}
                      placeholder="Provide a detailed, attractive description about rooms, local highlights, transport accessibility..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="input-field resize-none"
                      required
                    />
                  </div>

                  {/* Property Type selection */}
                  <div className="space-y-2">
                    <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Property Type</label>
                    <select 
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="input-field cursor-pointer"
                    >
                      {['Apartment', 'Villa', 'Studio', 'PG', 'Commercial'].map(t => (
                        <option key={t} value={t} className="bg-slate-900">{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* STEP 2: LOCATION */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Where is the property?</h2>
                    <p className="text-slate-500 text-xs">Tenants can lookup properties by city or address locales.</p>
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">City</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Mumbai, Bangalore, Pune"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>

                  {/* Locality address */}
                  <div className="space-y-2">
                    <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Full Locality Address</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Bandra West, Carter Road, Suite 402"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: DETAILS & PRICE */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Pricing & Specifications</h2>
                    <p className="text-slate-500 text-xs">Fill details about monthly rents, size, and layout bedrooms.</p>
                  </div>

                  {/* Prices & Deposits */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Monthly Rent (₹)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 45000"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="input-field"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Security Deposit (₹)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 60000"
                        value={securityDeposit}
                        onChange={(e) => setSecurityDeposit(e.target.value)}
                        className="input-field"
                        required
                      />
                    </div>
                  </div>

                  {/* Size & Layout */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Size (Sq. Ft)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 1200"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="input-field"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Bedrooms</label>
                      <select 
                        value={bedrooms}
                        onChange={(e) => setBedrooms(e.target.value)}
                        className="input-field cursor-pointer"
                      >
                        {['0', '1', '2', '3', '4', '5+'].map(num => (
                          <option key={num} value={num} className="bg-slate-900">{num}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Bathrooms</label>
                      <select 
                        value={bathrooms}
                        onChange={(e) => setBathrooms(e.target.value)}
                        className="input-field cursor-pointer"
                      >
                        {['1', '2', '3', '4+'].map(num => (
                          <option key={num} value={num} className="bg-slate-900">{num}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: AMENITIES & IMAGES */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Amenities selection</h2>
                    <p className="text-slate-500 text-xs">Tick all amenities that are accessible on this property.</p>
                  </div>

                  {/* Checkboxes grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {['Pool', 'Gym', 'Parking', 'Security', 'Garden', 'WiFi', 'Meals', 'AC', 'Laundry'].map((amenity) => {
                      const selected = amenities.includes(amenity);
                      return (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => toggleAmenity(amenity)}
                          className={`flex items-center gap-3 p-3.5 glass rounded-2xl border transition-all text-left ${
                            selected 
                              ? 'border-primary-500/50 bg-primary-600/10 text-white' 
                              : 'border-white/8 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <span className="text-lg">
                            {amenity === 'Pool' && '🏊'}
                            {amenity === 'Gym' && '💪'}
                            {amenity === 'Parking' && '🚗'}
                            {amenity === 'Security' && '🛡️'}
                            {amenity === 'Garden' && '🏡'}
                            {amenity === 'WiFi' && '📶'}
                            {amenity === 'Meals' && '🍛'}
                            {amenity === 'AC' && '❄️'}
                            {amenity === 'Laundry' && '🧺'}
                          </span>
                          <span className="text-sm font-semibold">{amenity}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Mock Upload Banner */}
                  <div className="space-y-2">
                    <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Property Image Preview</label>
                    <div className="border border-dashed border-slate-700 rounded-2xl p-6 text-center text-slate-500 text-xs">
                      📷 Main image falls back to default Unsplash property photos.
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Actions */}
              <div className="flex gap-4 justify-between border-t border-white/8 pt-6 mt-8">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-3 glass text-slate-300 hover:text-white border border-white/8 hover:bg-white/5 rounded-xl font-semibold text-sm transition-all"
                  >
                    ← Back
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn-primary text-sm px-6 py-3"
                  >
                    Continue →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="btn-primary text-sm px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 border border-emerald-500/20"
                  >
                    Publish Listing ⚡
                  </button>
                )}
              </div>

            </motion.div>
          </AnimatePresence>

        </div>

      </div>
    </div>
  );
}
