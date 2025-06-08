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

export const Route = createFileRoute("/stations/$schedule")({
  component: ScheduleFromStation,
});

function ScheduleFromStation() {
  const { schedule } = Route.useParams();

  const { data, isLoading, error } = useQuery<Schedule>({
    queryKey: ["stations", schedule],
    refetchInterval: 30000,
    enabled: !!schedule,
    queryFn: async () => {
      const response = await fetch(
        `http://localhost:8080/schedule/${schedule}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const jsonData = await response.json();
      return {
        ...jsonData,
        trains: jsonData.trains.slice(0, 12),
      };
    },
  });

  if (isLoading)
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-yellow-300 bg-black font-mono text-xl">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-black text-red-400 font-mono text-xl">
        Error: {error.message}
      </div>
    );
  if (!data)
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-black text-yellow-300 font-mono text-xl">
        No data available
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col items-center justify-center p-2 sm:p-4 font-mono">
      <div className="w-full max-w-3xl bg-neutral-950 border-4 border-neutral-700 rounded-md overflow-hidden shadow-2xl">
        <div className="bg-green-600 px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
          <div className="flex items-baseline gap-1 sm:gap-2">
            <span className="text-white font-bold text-lg sm:text-xl md:text-2xl tracking-wide">
              Salidas
            </span>
            <span className="text-white text-[0.6rem] sm:text-xs md:text-sm opacity-90 tracking-wider">
              DEPARTURES
            </span>
          </div>
          <div className="text-white font-bold text-xl sm:text-2xl md:text-3xl tracking-tighter">
            adif
          </div>
        </div>
        <div className="px-3 sm:px-4 py-1.5 sm:py-2 border-b-2 border-neutral-700">
          <div className="grid grid-cols-12 gap-2 sm:gap-4 text-yellow-400 text-[0.65rem] sm:text-xs md:text-sm tracking-wider font-bold">
            <div className="col-span-1 text-center">
              Vía
              <br />
              <span className="opacity-70 font-normal text-[0.85em]">
                PLATFORM
              </span>
            </div>
            <div className="col-span-7 flex items-center">
              <div>
                Destino
                <br />
                <span className="opacity-70 font-normal text-[0.85em]">
                  DESTINATION
                </span>
              </div>
            </div>
            <div className="col-span-4 text-right">
              Próximo tren
              <br />
              <span className="opacity-70 font-normal text-[0.85em]">
                NEXT TRAIN
              </span>
            </div>
          </div>
        </div>
        <div className="px-3 sm:px-4 bg-neutral-900">
          {data.trains.map((train, index) => (
            <div
              key={`${train.name}-${index}`}
              className="grid grid-cols-12 gap-2 sm:gap-4 py-1.5 sm:py-2 text-yellow-300 hover:bg-neutral-800 transition-colors duration-150 items-center border-b border-neutral-800 last:border-b-0"
            >
              <div className="col-span-1 font-bold text-lg sm:text-xl md:text-2xl text-center">
                {train.via}
              </div>
              <div className="col-span-7 truncate text-lg sm:text-xl md:text-2xl tracking-tight">
                {train.destination.toUpperCase()}
              </div>
              <div className="col-span-4 text-right font-bold text-lg sm:text-xl md:text-2xl">
                {train.time}
              </div>
            </div>
          ))}
        </div>
        <div className="bg-neutral-800 px-3 sm:px-4 py-1 border-t-2 border-neutral-700">
          <div className="flex justify-between items-center text-yellow-400 text-[0.55rem] sm:text-[0.65rem] tracking-wider">
            <span className="opacity-80">INFORMACIÓN EN TIEMPO REAL</span>
            <div className="flex items-center gap-x-2 sm:gap-x-3">
              <span className="opacity-80">
                {new Date(data.timestamp).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
              <span className="opacity-60">MP ELECTRONICS</span>
            </div>
          </div>
        </div>
      </div>
      {/* Station name below */}
      <div className="text-center mt-4 sm:mt-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-700">
          {data.station_name}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Actualizado: {new Date(data.timestamp).toLocaleString("es-ES")}
        </p>
      </div>
    </div>
  );
}
