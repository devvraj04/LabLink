import React, { useState } from 'react';
import { Droplet, ArrowRight, Info } from 'lucide-react';

const BloodCompatibilityCalculator = () => {
  const [selectedBloodType, setSelectedBloodType] = useState('');
  const [mode, setMode] = useState('receive'); // 'receive' or 'donate'

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const compatibilityChart = {
    'A+': {
      canReceiveFrom: ['A+', 'A-', 'O+', 'O-'],
      canDonateTo: ['A+', 'AB+']
    },
    'A-': {
      canReceiveFrom: ['A-', 'O-'],
      canDonateTo: ['A+', 'A-', 'AB+', 'AB-']
    },
    'B+': {
      canReceiveFrom: ['B+', 'B-', 'O+', 'O-'],
      canDonateTo: ['B+', 'AB+']
    },
    'B-': {
      canReceiveFrom: ['B-', 'O-'],
      canDonateTo: ['B+', 'B-', 'AB+', 'AB-']
    },
    'AB+': {
      canReceiveFrom: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      canDonateTo: ['AB+']
    },
    'AB-': {
      canReceiveFrom: ['A-', 'B-', 'AB-', 'O-'],
      canDonateTo: ['AB+', 'AB-']
    },
    'O+': {
      canReceiveFrom: ['O+', 'O-'],
      canDonateTo: ['A+', 'B+', 'AB+', 'O+']
    },
    'O-': {
      canReceiveFrom: ['O-'],
      canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    }
  };

  const getCompatibleTypes = () => {
    if (!selectedBloodType) return [];
    return mode === 'receive' 
      ? compatibilityChart[selectedBloodType].canReceiveFrom
      : compatibilityChart[selectedBloodType].canDonateTo;
  };

  const isUniversalDonor = selectedBloodType === 'O-';
  const isUniversalRecipient = selectedBloodType === 'AB+';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
      <h2 className="text-2xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
        <Droplet className="h-7 w-7 text-red-500" />
        Blood Compatibility Calculator
      </h2>

      {/* Mode Selection */}
      <div className="mb-6">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode('receive')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              mode === 'receive'
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            Can Receive From
          </button>
          <button
            onClick={() => setMode('donate')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              mode === 'donate'
                ? 'bg-red-600 text-white'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            Can Donate To
          </button>
        </div>
      </div>

      {/* Blood Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-zinc-700 mb-3">
          Select Your Blood Type
        </label>
        <div className="grid grid-cols-4 gap-3">
          {bloodTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedBloodType(type)}
              className={`py-3 px-4 rounded-lg font-bold text-lg transition-all ${
                selectedBloodType === type
                  ? 'bg-red-600 text-white shadow-lg scale-105'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {selectedBloodType && (
        <div className="space-y-4">
          {/* Special Labels */}
          {(isUniversalDonor || isUniversalRecipient) && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <Info className="h-5 w-5" />
                <span className="font-semibold">
                  {isUniversalDonor && 'Universal Donor! 🌟'}
                  {isUniversalRecipient && 'Universal Recipient! 🌟'}
                </span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                {isUniversalDonor && 'O- blood can be given to anyone in emergencies'}
                {isUniversalRecipient && 'AB+ individuals can receive blood from any type'}
              </p>
            </div>
          )}

          {/* Compatibility Display */}
          <div className="bg-zinc-50 rounded-lg p-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="text-center">
                <div className="bg-red-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mb-2">
                  {selectedBloodType}
                </div>
                <div className="text-sm text-zinc-600">Your Type</div>
              </div>
              
              <ArrowRight className="h-8 w-8 text-zinc-400" />
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {getCompatibleTypes().length}
                </div>
                <div className="text-sm text-zinc-600">
                  {mode === 'receive' ? 'Compatible Donors' : 'Compatible Recipients'}
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium text-zinc-700 mb-3">
                {mode === 'receive' 
                  ? `${selectedBloodType} can receive blood from:`
                  : `${selectedBloodType} can donate blood to:`
                }
              </p>
              <div className="flex flex-wrap gap-2">
                {getCompatibleTypes().map((type) => (
                  <span
                    key={type}
                    className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Important Notes:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Blood type compatibility is crucial for safe transfusions</li>
              <li>• Always verify with medical professionals before transfusion</li>
              <li>• Rh factor (+ or -) is also important for compatibility</li>
              <li>• In emergencies, O- blood is often used as it's universal</li>
            </ul>
          </div>
        </div>
      )}

      {!selectedBloodType && (
        <div className="text-center py-8 text-zinc-500">
          <Droplet className="h-16 w-16 text-zinc-300 mx-auto mb-3" />
          <p>Select a blood type to see compatibility information</p>
        </div>
      )}
    </div>
  );
};

export default BloodCompatibilityCalculator;
