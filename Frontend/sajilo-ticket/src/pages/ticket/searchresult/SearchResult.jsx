import React, { useState, useEffect, useContext } from 'react';
import TicketCard from '../../../components/ticket/TicketCard';
import { FaBus } from 'react-icons/fa6';
import { GrRefresh } from 'react-icons/gr';
import axios from 'axios';
import { UserAppContext } from '../../../context/UserAppContext';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';

const SearchResult = () => {
  const { backendUrl } = useContext(UserAppContext);
  const location = useLocation();

  // Parse query parameters from the URL (if any)
  const searchParams = new URLSearchParams(location.search);
  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');
  const dateParam = searchParams.get('date');

  const [dataToShow, setDataToShow] = useState([]);
  const [skip, setSkip] = useState(0);
  const limit = 10;
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // When the search parameters change (or on mount), fetch the ticket data.
  useEffect(() => {
    fetchTicketData(true);
  }, [fromParam, toParam, dateParam]);

  const fetchTicketData = async (reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      // Build the query string. If search parameters are provided, add them.
      const params = new URLSearchParams();
      params.append("skip", reset ? 0 : skip);
      params.append("limit", limit);
      if (fromParam) params.append("from", fromParam);
      if (toParam) params.append("to", toParam);
      if (dateParam) params.append("date", dateParam);

      const response = await axios.get(
        `${backendUrl}/api/search/busdata?${params.toString()}`
      );
      const fetchedData = response.data;
      if (fetchedData.length === 0) {
        toast.info("No more buses available");
        setHasMore(false);
      } else {
        if (reset) {
          setDataToShow(fetchedData);
          setSkip(limit);
          setHasMore(true);
        } else {
          setDataToShow(prev => [...prev, ...fetchedData]);
          setSkip(prev => prev + limit);
        }
      }
    } catch (error) {
      toast.error("Error fetching bus data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full col-span-3 space-y-10 pt-11">
      <div className="space-y-6">
        {dataToShow && dataToShow.length > 0 ? (
          dataToShow.map((ticket, index) => (
            <TicketCard
              key={index}
              icon={FaBus}
              busName={ticket.bus?.busName || "Unknown Bus"}
              routeFrom={`${ticket.route?.from || "Origin"} (${ticket.route?.pickupPoints?.join(", ") || ""})`}
              routeTo={`${ticket.route?.to || "Destination"} (${ticket.route?.dropPoints?.join(", ") || ""})`}
              arrivalTime={ticket.fromTime}
              departureTime={ticket.toTime}
              price={ticket.route?.price || 0}
              availableSeats={
                ticket.seats?.dates?.[ticket.scheduleDateStr]
                  ? ticket.seats?.dates?.[ticket.scheduleDateStr].available?.length
                  : ticket.seats?.global?.available?.length || 0
              }
              amenities={ticket.bus?.amenities || []}
              date={ticket.scheduleDateStr}
            />
          ))
        ) : (
          <p className="text-center text-neutral-600">No buses to display</p>
        )}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="w-full flex items-center justify-center">
          <button
            onClick={() => fetchTicketData(false)}
            disabled={loading}
            className="w-fit px-8 py-3 bg-primary hover:bg-transparent border-2 border-primary hover:border-primary rounded-xl text-base font-normal text-neutral-50 flex items-center justify-center gap-x-2 hover:text-primary ease-in-out duration-300"
          >
            {loading ? "Loading..." : (
              <>
                <GrRefresh />
                Load More
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchResult;