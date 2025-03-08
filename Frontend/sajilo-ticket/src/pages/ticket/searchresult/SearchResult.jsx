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

  // Parse query parameters
  const searchParams = new URLSearchParams(location.search);
  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');
  const dateParam = searchParams.get('date');

  const [dataToShow, setDataToShow] = useState([]);
  const [skip, setSkip] = useState(0);
  const limit = 10;
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // If query parameters exist, perform the search; otherwise, load default data.
  useEffect(() => {
    if (fromParam && toParam && dateParam) {
      // Call the search endpoint using the query parameters
      searchBuses(fromParam, toParam, dateParam);
    } else {
      // No search criteria: fetch default bus data
      fetchBusData(true);
    }
  }, [fromParam, toParam, dateParam]);

  const searchBuses = async (from, to, date) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${backendUrl}/api/search/bus?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`
      );
      if (!response.data || response.data.length === 0) {
        toast.info("No buses found");
        setDataToShow([]);
      } else {
        setDataToShow(response.data);
      }
    } catch (error) {
      toast.error("Error searching for buses");
    } finally {
      setLoading(false);
    }
  };

  const fetchBusData = async (reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `${backendUrl}/api/search/busdata?skip=${reset ? 0 : skip}&limit=${limit}`
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
          dataToShow.map((data, index) => (
            <TicketCard
              key={index}
              icon={FaBus}
              busName={data.bus?.busName || "Unknown Bus"}
              routeFrom={`${data.route?.from || "Origin"} (${data.route?.pickupPoints?.join(", ") || ""})`}
              routeTo={`${data.route?.to || "Destination"} (${data.route?.dropPoints?.join(", ") || ""})`}
              arrivalTime={data.fromTime}
              departureTime={data.toTime}
              price={data.route?.price || 0}
              availableSeats={5}
              amenities={data.bus?.amenities || []}
            />
          ))
        ) : (
          <p className="text-center text-neutral-600">No buses to display</p>
        )}
      </div>

      {/* Only show Load More if no search criteria exist (i.e. default data) */}
      {!(fromParam && toParam && dateParam) && hasMore && (
        <div className="w-full flex items-center justify-center">
          <button
            onClick={() => fetchBusData(false)}
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
