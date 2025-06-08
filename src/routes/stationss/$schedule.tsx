import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, useMemo } from "react";

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

// Renamed keyframes to avoid conflict with Tailwind's default 'marquee'
const customMarqueeKeyframes = `
@keyframes customMarquee {
  0% { transform: translateX(0%); }
  100% { transform: translateX(-50%); }
}
`;

export const Route = createFileRoute("/stationss/$schedule")({
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

  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  );

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  const randomTrainNumbers = useMemo(() => {
    if (!data || !data.trains) return [];
    return data.trains.map(() => Math.floor(18000 + Math.random() * 7000));
  }, [data]); // Re-calculate only when data.trains changes

  if (isLoading)
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-yellow-300 bg-black font-sans text-xl">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-black text-red-400 font-sans text-xl">
        Error: {error.message}
      </div>
    );
  if (!data)
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-black text-yellow-300 font-sans text-xl">
        No data available
      </div>
    );

  const marqueeText =
    "Atocha Cercanías · Méndez Álvaro · Delicias · Pirámides · P.Pío ·";

  return (
    <>
      <style>{customMarqueeKeyframes}</style>
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-1 sm:p-2 font-sans">
        <div className="w-full max-w-5xl bg-[#0E2A4F] border-2 border-gray-700 shadow-2xl rounded-sm overflow-hidden">
          <div className="flex justify-between items-center bg-[#2E79BA] px-3 sm:px-4 py-1.5 sm:py-2">
            <span className="text-white font-bold text-2xl sm:text-3xl">
              adif
            </span>
            <div className="text-white font-bold text-2xl sm:text-3xl tracking-wider">
              {currentTime}
            </div>
          </div>

          <div className="text-white">
            {data.trains.map((train, index) => (
              <div
                key={`${train.name}-${train.destination}-${index}`} // Stable key
                className="grid grid-cols-[max-content_1fr_max-content_max-content_max-content] gap-x-2 sm:gap-x-3 md:gap-x-4 items-center px-2 sm:px-3 py-1.5 sm:py-2 border-b border-gray-600 last:border-b-0"
              >
                <div className="text-lg sm:text-xl md:text-2xl whitespace-nowrap text-left pr-1 sm:pr-2">
                  {train.time.includes("min") ? (
                    <>
                      <span className="font-bold">
                        {train.time.split(" ")[0]}
                      </span>
                      <span className="text-[0.6em] sm:text-[0.7em] align-middle ml-0.5 sm:ml-1">
                        {train.time.split(" ").slice(1).join(" ")}
                      </span>
                    </>
                  ) : (
                    <span className="font-medium">{train.time}</span>
                  )}
                </div>

                <div className="overflow-hidden flex flex-col justify-center">
                  {" "}
                  {/* Column for destination and marquee */}
                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <span
                      className={`
                        ${train.name.toLowerCase().includes("c-10") ? "bg-[#3E7AB3]" : "bg-[#A0CE5D]"} 
                        text-white px-1.5 sm:px-2 py-0.5 rounded-sm text-sm sm:text-base md:text-lg font-bold leading-tight
                      `}
                    >
                      {train.name}
                    </span>
                    <span className="text-base sm:text-lg md:text-xl font-bold truncate">
                      {train.destination}
                    </span>
                  </div>
                  <div className="mt-0.5 sm:mt-1 text-[0.6rem] sm:text-xs text-gray-300 overflow-hidden whitespace-nowrap">
                    <div
                      className="inline-block"
                      style={{ animation: "customMarquee 25s linear infinite" }}
                    >
                      <span>{marqueeText}    </span>
                      <span>{marqueeText}    </span>
                      <span>{marqueeText}    </span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#A64999] text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-sm text-[0.6rem] sm:text-xs flex flex-col items-center justify-center leading-tight">
                  <span className="font-semibold">renfe</span>
                  <span>Cercanías</span>
                </div>

                <div className="text-base sm:text-lg md:text-xl text-center font-medium tabular-nums">
                  {randomTrainNumbers[index]}
                </div>

                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-center min-w-[2rem] sm:min-w-[2.5rem]">
                  {train.via}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
