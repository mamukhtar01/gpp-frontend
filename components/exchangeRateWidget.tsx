
export function ExchangeRateWidget({ exchangeRate }: { exchangeRate: number | null }) {
    return (
      <>
           {/* Exchange Rate Display */}
      <div className="mb-6 text-sm font-medium text-gray-700 flex items-center gap-2">
        {exchangeRate === null ? (
          <span className="text-red-500">
            Exchange rate (USD → NPR) unavailable.
          </span>
        ) : (
          <>
            <span>
              <span className="font-semibold">Exchange Rate:</span> 1 USD ={" "}
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