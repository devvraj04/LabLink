import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Droplet, 
  Phone, 
  Navigation, 
  AlertCircle,
  Loader2,
  Building2,
  RefreshCw,
  Globe,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { fetchNearbyBloodStock, getCurrentLocation } from '../services/eRaktKoshService';

// Blood Group Code Mapping
const BLOOD_GROUP_CODES = {
  'A+': 11, 'A-': 12,
  'B+': 13, 'B-': 14,
  'O+': 15, 'O-': 16,
  'AB+': 17, 'AB-': 18
};


// Get stock level indicator
const getStockLevel = (stockStr) => {
  const units = parseInt(stockStr);
  if (isNaN(units)) return { level: 'medium', color: 'bg-amber-500', text: 'Available' };
  if (units >= 40) return { level: 'high', color: 'bg-emerald-500', text: 'High Stock' };
  if (units >= 15) return { level: 'medium', color: 'bg-amber-500', text: 'Medium Stock' };
  if (units >= 5) return { level: 'low', color: 'bg-orange-500', text: 'Low Stock' };
  return { level: 'critical', color: 'bg-red-500', text: 'Critical' };
};

const BloodStockMapPage = () => {
  const [bloodBanks, setBloodBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('O+');
  const [selectedBank, setSelectedBank] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const bloodGroupOptions = Object.keys(BLOOD_GROUP_CODES);

  // Get user location on mount
  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    setLocationLoading(true);
    setError(null);
    
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
      // Auto-search once we have location
      searchBloodStock(location.latitude, location.longitude);
    } catch (err) {
      setError(err.message || 'Failed to get your location. Please enable location access.');
      setLocationLoading(false);
    }
  };

  // Re-search when blood group changes
  useEffect(() => {
    if (userLocation) {
      searchBloodStock(userLocation.latitude, userLocation.longitude);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBloodGroup]);

  const searchBloodStock = async (lat, long) => {
    setLoading(true);
    setError(null);

    try {
      const results = await fetchNearbyBloodStock(lat || userLocation?.latitude, long || userLocation?.longitude, selectedBloodGroup);
      
      if (!results || results.length === 0) {
        setError(`No blood banks found with ${selectedBloodGroup} blood stock nearby. Try expanding your search radius or contacting major hospitals directly.`);
        setBloodBanks([]);
        setSelectedBank(null);
      } else {
        setBloodBanks(results);
        setSelectedBank(results[0]);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to fetch blood stock data. Please try again.');
      setBloodBanks([]);
    } finally {
      setLoading(false);
      setLocationLoading(false);
    }
  };

  const handleRefresh = () => {
    if (userLocation) {
      searchBloodStock(userLocation.latitude, userLocation.longitude);
    } else {
      getUserLocation();
    }
  };

  const formatDistance = (distance) => {
    if (!distance) return 'N/A';
    return `${parseFloat(distance).toFixed(1)} km away`;
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Header */}
        <div className="content-card p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                <MapPin className="h-6 w-6 sm:h-7 sm:w-7 text-teal-500" />
                Live Blood Stock Map
              </h1>
              <p className="text-sm text-gray-500">Find nearby blood banks and check real-time stock availability</p>
            </div>
            <div className="flex items-center gap-3">
              {lastUpdated && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock className="h-3.5 w-3.5" />
                  Updated {lastUpdated.toLocaleTimeString()}
                </div>
              )}
              <a 
                href="https://www.eraktkosh.in" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full text-white text-xs font-medium flex items-center gap-1.5 hover:shadow-lg transition-all"
              >
                <Globe className="h-3 w-3" />
                eRaktKosh
              </a>
            </div>
          </div>

          {/* Blood Group Selector */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-600 mr-2">Select Blood Group:</span>
              {bloodGroupOptions.map((bg) => (
                <button
                  key={bg}
                  onClick={() => setSelectedBloodGroup(bg)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    selectedBloodGroup === bg
                      ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/30 scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {bg}
                </button>
              ))}
              <button
                onClick={handleRefresh}
                disabled={loading || locationLoading}
                className="ml-auto px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {(loading || locationLoading) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {locationLoading ? 'Getting Location...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Stock Level Legend */}
        <div className="flex flex-wrap items-center gap-4 px-2">
          <span className="text-sm text-gray-500">Stock Levels:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span className="text-xs text-gray-600">High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="text-xs text-gray-600">Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
            <span className="text-xs text-gray-600">Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="text-xs text-gray-600">Critical</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="content-card p-4 border-l-4 border-amber-500 bg-amber-50">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">{error}</p>
                <p className="text-xs text-amber-600 mt-1">
                  {selectedBloodGroup.includes('-') ? 'Negative blood types are rare. Contact multiple blood banks.' : 'Try a different blood group or location.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="content-card p-12 text-center">
            <Loader2 className="h-12 w-12 text-teal-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Searching nearby blood banks...</p>
          </div>
        )}

        {/* Main Content - Two Column Layout */}
        {!loading && bloodBanks.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Blood Bank List - Left Column */}
            <div className="lg:col-span-2 content-card p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">
                  Blood Bank Locations
                </h2>
                <span className="text-sm text-gray-500">{bloodBanks.length} found</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-2">
                {bloodBanks.map((bank, index) => {
                  const stockInfo = getStockLevel(bank.stock);
                  return (
                    <div 
                      key={bank.id || index}
                      onClick={() => setSelectedBank(bank)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                        selectedBank?.id === bank.id 
                          ? 'border-teal-500 bg-teal-50/50 shadow-lg' 
                          : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          selectedBank?.id === bank.id 
                            ? 'bg-gradient-to-br from-teal-500 to-cyan-500' 
                            : 'bg-gray-100'
                        }`}>
                          <MapPin className={`h-5 w-5 ${selectedBank?.id === bank.id ? 'text-white' : 'text-gray-500'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 text-sm leading-tight line-clamp-1">
                            {bank.hospitalName}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Navigation className="h-3 w-3 text-teal-500" />
                            <span className="text-xs text-teal-600 font-medium">{formatDistance(bank.distance)}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`w-2 h-2 rounded-full ${stockInfo.color}`}></span>
                            <span className="text-xs text-gray-600">{bank.stock}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hospital Details - Right Column */}
            <div className="content-card p-4 sm:p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Hospital Details</h2>
              
              {selectedBank ? (
                <div className="space-y-6">
                  {/* Hospital Name */}
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg leading-tight mb-1">
                      {selectedBank.hospitalName}
                    </h3>
                    <p className="text-sm text-gray-500">{selectedBank.city}, {selectedBank.state}</p>
                  </div>

                  {/* Blood Stock Section */}
                  <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Droplet className="h-5 w-5 text-red-500" />
                      <span className="font-semibold text-gray-800">Blood Stock</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Blood Group</span>
                        <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-rose-500 rounded-lg text-white text-sm font-bold">
                          {selectedBloodGroup}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Available</span>
                        <span className="text-lg font-bold text-gray-800">{selectedBank.stock}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Component</span>
                        <span className="text-sm text-gray-800">{selectedBank.component}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status</span>
                        <span className={`flex items-center gap-1.5 text-sm font-medium ${
                          getStockLevel(selectedBank.stock).level === 'high' ? 'text-emerald-600' :
                          getStockLevel(selectedBank.stock).level === 'medium' ? 'text-amber-600' :
                          getStockLevel(selectedBank.stock).level === 'low' ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          <CheckCircle2 className="h-4 w-4" />
                          {getStockLevel(selectedBank.stock).text}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Contact Information</h4>
                    <div className="space-y-2">
                      <a 
                        href={`tel:${selectedBank.contact}`}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <Phone className="h-4 w-4 text-teal-500" />
                        <span className="text-sm text-gray-700">{selectedBank.contact}</span>
                      </a>
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                        <MapPin className="h-4 w-4 text-teal-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{selectedBank.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedBank.hospitalName + ' ' + selectedBank.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full px-4 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all flex items-center justify-center gap-2"
                    >
                      <Navigation className="h-5 w-5" />
                      Get Directions
                    </a>
                    <a
                      href={`tel:${selectedBank.contact}`}
                      className="w-full px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                    >
                      <Phone className="h-5 w-5" />
                      Call Hospital
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Select a blood bank to view details</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Footer */}
        <div className="text-center text-xs text-gray-400 py-4">
          <p>Data powered by Indian blood bank network • eRaktKosh Integration</p>
          <p className="mt-1">For emergencies, call <span className="text-red-500 font-medium">104</span> (Health Helpline)</p>
        </div>
      </div>
    </div>
  );
};

export default BloodStockMapPage;
