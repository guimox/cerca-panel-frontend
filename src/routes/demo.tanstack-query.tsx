import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

export interface Schedule {
  timestamp: Date;
  station: string;
  station_name: string;
  trains: Train[];
}

export interface Train {
  time: string;
  destination: string;
  name: string;
  via: string;
}

export const Route = createFileRoute("/demo/tanstack-query")({
  component: TanStackQueryDemo,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      station: search.station as string,
    };
  },
});

function TanStackQueryDemo() {
  const search = Route.useSearch();
  const { data, isLoading, error } = useQuery<Schedule>({
    queryKey: ["stations", search.station],
    refetchInterval: 30000, // 30 seconds in
    enabled: !!search.station, // Only run query if we have a station
    queryFn: async () => {
      const response = await fetch(
        `http://localhost:8080/schedule/${search.station}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
  });

  if (!search.station) {
    return (
      <div className="text-gray-500 p-4">
        Please provide a station parameter
      </div>
    );
  }

  if (isLoading)
    return <div className="flex justify-center p-8">Loading...</div>;
  if (error)
    return <div className="text-red-500 p-4">Error: {error.message}</div>;
  if (!data) return <div className="text-gray-500 p-4">No data available</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        {data.station_name}
      </h1>
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <p className="text-sm text-gray-600">
            Last updated: {new Date(data.timestamp).toLocaleString()}
          </p>
        </div>
        <ul className="divide-y divide-gray-200">
          {data.trains.map((train, index) => (
            <li
              key={`${train.name}-${index}`}
              className="p-4 hover:bg-gray-50 transition-colors duration-150"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-medium">
                      {train.name}
                    </span>
                    <span className="text-lg font-semibold text-gray-900">
                      {train.time}
                    </span>
                  </div>
                  <div className="text-gray-600">
                    <span className="font-medium">To: </span>
                    {train.destination}
                  </div>
                  {train.via && (
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Via: </span>
                      {train.via}
                    </div>
                  )}
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
