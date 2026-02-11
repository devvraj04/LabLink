import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Navigation, 
  AlertCircle,
  Loader2,
  RefreshCw,
  Globe,
  Clock,
  CheckCircle2,
  Hospital,
  Activity
} from 'lucide-react';
import { fetchNearbyFacilities, getCurrentLocation } from '../services/eRaktKoshService';

const HospitalNetworkPage = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [searchRadius, setSearchRadius] = useState(10);

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
      searchNearbyHospitals(location.latitude, location.longitude);
    } catch (err) {
      setError(err.message || 'Failed to get your location. Please enable location access.');
      setLocationLoading(false);
    }
  };

  const searchNearbyHospitals = async (lat, long) => {
    setLoading(true);
    setError(null);

    try {
      const results = await fetchNearbyFacilities(
        lat || userLocation?.latitude, 
        long || userLocation?.longitude, 
        searchRadius
      );
      
      if (!results || results.length === 0) {
        setError(`No blood bank facilities found within ${searchRadius}km radius. Try increasing the search radius.`);
        setHospitals([]);
        setSelectedHospital(null);
      } else {
        setHospitals(results);
        setSelectedHospital(results[0]);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to fetch hospital data. Please try again.');
      setHospitals([]);
    } finally {
      setLoading(false);
      setLocationLoading(false);
    }
  };

  const handleRefresh = () => {
    if (userLocation) {
      searchNearbyHospitals(userLocation.latitude, userLocation.longitude);
    } else {
      getUserLocation();
    }
  };

  const handleRadiusChange = (newRadius) => {
    setSearchRadius(newRadius);
    if (userLocation) {
      searchNearbyHospitals(userLocation.latitude, userLocation.longitude);
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
                <Building2 className="h-6 w-6 sm:h-7 sm:w-7 text-teal-500" />
                Hospital & Blood Bank Network
              </h1>
              <p className="text-sm text-gray-500">Find nearby hospitals and blood bank facilities using eRaktKosh database</p>
            </div>
            <div className="flex items-center gap-3">
              {lastUpdated && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock className="h-3.5 w-3.5" />
                  {lastUpdated.toLocaleTimeString()}
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

          {/* Search Controls */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Search Radius:</span>
              {[5, 10, 20, 50].map((radius) => (
                <button
                  key={radius}
                  onClick={() => handleRadiusChange(radius)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    searchRadius === radius
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {radius} km
                </button>
              ))}
            </div>
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

        {/* Error State */}
        {error && (
          <div className="content-card p-4 bg-red-50 border border-red-100">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Unable to fetch data</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {(loading || locationLoading) && (
          <div className="content-card p-8 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-12 w-12 text-teal-500 animate-spin" />
            <p className="text-gray-600 font-medium">
              {locationLoading ? 'Getting your location...' : 'Searching for nearby facilities...'}
            </p>
          </div>
        )}

        {/* Results */}
        {!loading && !locationLoading && hospitals.length > 0 && (
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
            
            {/* List View */}
            <div className="content-card p-4 sm:p-6 space-y-3 max-h-[800px] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Hospital className="h-5 w-5 text-teal-500" />
                  Found {hospitals.length} Facilities
                </h2>
              </div>

              {hospitals.map((hospital) => (
                <div
                  key={hospital.id}
                  onClick={() => setSelectedHospital(hospital)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedHospital?.id === hospital.id
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-100 bg-white hover:border-teal-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 mb-1 line-clamp-2">
                        {hospital.name}
                      </h3>
                      {hospital.distance && (
                        <div className="flex items-center gap-1.5 text-sm text-teal-600 font-medium">
                          <Navigation className="h-3.5 w-3.5" />
                          {formatDistance(hospital.distance)}
                        </div>
                      )}
                    </div>
                    <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      hospital.facilityType?.toLowerCase().includes('blood bank')
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {hospital.facilityType || 'Blood Bank'}
                    </div>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{hospital.address}</span>
                    </div>
                    {hospital.city && hospital.state && (
                      <div className="text-xs text-gray-500 ml-5">
                        {hospital.city}, {hospital.state} {hospital.pincode && `- ${hospital.pincode}`}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Detail View */}
            <div className="content-card p-4 sm:p-6 sticky top-6">
              {selectedHospital ? (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                        <Building2 className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-800 mb-1">
                          {selectedHospital.name}
                        </h2>
                        <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-700">
                          {selectedHospital.facilityType || 'Blood Bank Facility'}
                        </div>
                      </div>
                    </div>

                    {selectedHospital.distance && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-xl border border-teal-100">
                        <Navigation className="h-4 w-4 text-teal-600" />
                        <span className="text-teal-900 font-semibold">
                          {formatDistance(selectedHospital.distance)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Address */}
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedHospital.address}</p>
                        {selectedHospital.city && selectedHospital.state && (
                          <p className="text-xs text-gray-600 mt-1">
                            {selectedHospital.city}, {selectedHospital.state}
                            {selectedHospital.pincode && ` - ${selectedHospital.pincode}`}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Contact Info */}
                    {selectedHospital.contact && selectedHospital.contact !== 'N/A' && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Phone className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Contact Number</p>
                          <a 
                            href={`tel:${selectedHospital.contact}`}
                            className="text-sm font-semibold text-teal-600 hover:text-teal-700"
                          >
                            {selectedHospital.contact}
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Email */}
                    {selectedHospital.email && selectedHospital.email !== 'N/A' && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Mail className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <a 
                            href={`mailto:${selectedHospital.email}`}
                            className="text-sm font-semibold text-teal-600 hover:text-teal-700 break-all"
                          >
                            {selectedHospital.email}
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Blood Components */}
                    {selectedHospital.bloodComponents && selectedHospital.bloodComponents.length > 0 && (
                      <div className="p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-100">
                        <div className="flex items-center gap-2 mb-3">
                          <Activity className="h-4 w-4 text-red-600" />
                          <h3 className="text-sm font-bold text-red-900">Available Blood Components</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedHospital.bloodComponents.map((component, index) => (
                            <span 
                              key={index}
                              className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-red-700 border border-red-200"
                            >
                              {component}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all flex items-center justify-center gap-2">
                      <Phone className="h-4 w-4" />
                      Call Hospital
                    </button>
                    <button className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                      <Navigation className="h-4 w-4" />
                      Get Directions
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <Hospital className="h-16 w-16 mb-4" />
                  <p className="text-sm">Select a facility to view details</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && !locationLoading && !error && hospitals.length === 0 && (
          <div className="content-card p-12 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Building2 className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Facilities Found</h3>
            <p className="text-sm text-gray-500 max-w-md">
              Click the "Refresh" button to search for nearby hospitals and blood bank facilities
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalNetworkPage;
