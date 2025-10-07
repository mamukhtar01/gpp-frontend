
export function ExchangeRateWidget({ exchangeRate, className }: { exchangeRate: number | null, className?: string }) {
    return (
      <>
           {/* Exchange Rate Display */}
      <div className={`text-sm font-medium text-gray-700 flex items-center gap-2 ${className}`}>
        {exchangeRate === null ? (
          <span className="text-red-500">
            Exchange rate (USD → NPR) unavailable.
          </span>
        ) : (
          <>
            <span>
              <span className="font-light">Exchange Rate:</span> 1 USD ={" "}
              <span className="font-bold">{exchangeRate}</span> NPR
            </span>
            {exchangeRate && (
              <span className="text-xs text-gray-400 ml-2">
                (as of {new Date().toLocaleDateString()})
              </span>
            )}
          </>
        )}
      </div>
        </>
    );
  }