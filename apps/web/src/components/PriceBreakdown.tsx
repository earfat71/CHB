import { Pricing } from '@/lib/api';
import { formatBDT } from '@/lib/utils';

export function PriceBreakdown({ pricing, className = '' }: { pricing: Pricing; className?: string }) {
  return (
    <div className={`bg-gray-50 rounded-lg p-4 text-sm ${className}`}>
      <h4 className="font-semibold text-gray-800 mb-3">Price Breakdown</h4>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Room ({pricing.nights} night{pricing.nights > 1 ? 's' : ''} × {formatBDT(pricing.pricePerNight)})</span>
          <span className="font-medium">{formatBDT(pricing.baseTotalBdt)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Platform fee ({(pricing.rates.platformFeeRate * 100).toFixed(0)}%)</span>
          <span>{formatBDT(pricing.platformFeeBdt)}</span>
        </div>
        {pricing.agentCommBdt > 0 && (
          <div className="flex justify-between text-gray-600">
            <span>Agent commission ({(pricing.rates.agentCommRate * 100).toFixed(0)}%)</span>
            <span>{formatBDT(pricing.agentCommBdt)}</span>
          </div>
        )}
        <div className="flex justify-between text-gray-600">
          <span>VAT ({(pricing.rates.vatRate * 100).toFixed(0)}%)</span>
          <span>{formatBDT(pricing.vatBdt)}</span>
        </div>
        <div className="border-t pt-2 flex justify-between font-bold text-gray-900">
          <span>Total</span>
          <span className="text-brand-700 text-lg">{formatBDT(pricing.grandTotalBdt)}</span>
        </div>
      </div>
    </div>
  );
}
