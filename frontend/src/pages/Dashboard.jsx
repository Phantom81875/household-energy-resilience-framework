import { useEffect, useMemo, useState } from "react";
import API from "../api/api";

const ELECTRICITY_RATE = 0.16;

function Dashboard() {
  const [appliances, setAppliances] = useState([]);
  const [battery, setBattery] = useState(null);
  const [energySupply, setEnergySupply] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        // --------------------------------
        // Active household
        // --------------------------------

        const householdResponse = await API.get(
          "/households/active/"
        );

        const household =
          householdResponse.data;

        if (!household?.id) {
          throw new Error(
            "No active household found."
          );
        }

        const householdId =
          household.id;

        // --------------------------------
        // Appliances
        // --------------------------------

        const appliancesResponse =
          await API.get(
            `/households/${householdId}/appliances/`
          );

        setAppliances(
          Array.isArray(
            appliancesResponse.data
          )
            ? appliancesResponse.data
            : []
        );

        // --------------------------------
        // Batteries
        // --------------------------------

        const batteriesResponse =
          await API.get(
            `/households/${householdId}/batteries/`
          );

        setBattery(
          Array.isArray(
            batteriesResponse.data
          )
            ? batteriesResponse.data[0] || null
            : null
        );

        // --------------------------------
        // Energy Supply
        //
        // This record may not exist yet.
        // The backend returns 404 when it
        // doesn't exist, so don't let that
        // break the whole Dashboard.
        // --------------------------------

        try {
          const energySupplyResponse =
            await API.get(
              `/households/${householdId}/energysupply/`
            );

          setEnergySupply(
            energySupplyResponse.data || null
          );
        } catch (energySupplyError) {
          if (
            energySupplyError.response?.status ===
            404
          ) {
            console.warn(
              "No EnergySupply is configured for this household."
            );

            setEnergySupply(null);
          } else {
            throw energySupplyError;
          }
        }
      } catch (err) {
        console.error(
          "Dashboard API error:",
          err
        );

        console.error(
          "Response:",
          err.response?.data
        );

        console.error(
          "Request:",
          err.config?.url
        );

        setError(
          "Could not load household data."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  /*
   * Calculate dashboard information.
   */
  const energyData = useMemo(() => {
    const activeAppliances =
      appliances.filter(
        (appliance) => appliance.active
      );

    // --------------------------------
    // Current power
    // --------------------------------

    const power =
      activeAppliances.reduce(
        (total, appliance) =>
          total +
          Number(
            appliance.wattage || 0
          ),
        0
      );

    // --------------------------------
    // Daily energy
    // --------------------------------

    const energy =
      activeAppliances.reduce(
        (total, appliance) =>
          total +
          (
            Number(
              appliance.wattage || 0
            ) *
            Number(
              appliance.usage || 0
            )
          ) /
            1000,
        0
      );

    // --------------------------------
    // Electricity cost
    // --------------------------------

    const electricityRate =
      ELECTRICITY_RATE;

    const cost =
      energy * electricityRate;

    // --------------------------------
    // Battery
    // --------------------------------

    const capacity =
      Number(
        battery?.capacity || 0
      );

    const percentage =
      Number(
        battery?.current_percentage || 0
      );

    const efficiency =
      Number(
        battery?.efficiency || 0
      );

    const availableBattery =
      capacity *
      (percentage / 100);

    // --------------------------------
    // Battery runtime
    // --------------------------------

    const runtime =
      power > 0
        ? (
            availableBattery *
            (efficiency / 100)
          ) /
          (power / 1000)
        : 0;

    // --------------------------------
    // Energy supply
    // --------------------------------

    const supplyWattage =
      Number(
        energySupply?.wattage || 0
      );

    const supplyKW =
      supplyWattage / 1000;

    const remainingSupply =
      Math.max(
        supplyWattage - power,
        0
      );

    const supplyUtilization =
      supplyWattage > 0
        ? Math.min(
            (power /
              supplyWattage) *
              100,
            100
          )
        : 0;

    return {
      power,
      energy,
      cost,
      electricityRate,

      capacity,
      percentage,
      efficiency,

      availableBattery,
      runtime,

      supplyWattage,
      supplyKW,
      remainingSupply,
      supplyUtilization,

      hasEnergySupply:
        Boolean(energySupply),
    };
  }, [
    appliances,
    battery,
    energySupply,
  ]);

  // --------------------------------
  // Loading
  // --------------------------------

  if (loading) {
    return (
      <div className="page dashboard">

        <div className="page-header">

          <div>
            <h1>Dashboard</h1>

            <p>
              Loading household data...
            </p>
          </div>

        </div>

      </div>
    );
  }

  // --------------------------------
  // Error
  // --------------------------------

  if (error) {
    return (
      <div className="page dashboard">

        <div className="page-header">

          <div>
            <h1>Dashboard</h1>

            <p>{error}</p>
          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="page dashboard">

      {/* =========================
          HEADER
      ========================= */}

      <div className="page-header">

        <div>

          <h1>Dashboard</h1>

          <p>
            Monitor your household
            energy resilience.
          </p>

        </div>

        <div className="status-badge">

          <span className="status-dot"></span>

          System Ready

        </div>

      </div>


      {/* =========================
          SUMMARY
      ========================= */}

      <section className="summary-grid">

        {/* Current Power */}

        <div className="summary-card">

          <div className="card-label">
            Current Power
          </div>

          <div className="card-value">
            {(
              energyData.power / 1000
            ).toFixed(2)}{" "}
            kW
          </div>

          <div className="card-description">
            Current household usage
          </div>

        </div>


        {/* Energy Supply */}

        <div className="summary-card">

          <div className="card-label">
            Energy Supply
          </div>

          <div className="card-value">

            {energyData.hasEnergySupply
              ? `${energyData.supplyKW.toFixed(
                  2
                )} kW`
              : "Not configured"}

          </div>

          <div className="card-description">

            {energyData.hasEnergySupply
              ? `${energyData.supplyWattage.toLocaleString()} W capacity`
              : "No energy supply configured"}

          </div>

        </div>


        {/* Battery */}

        <div className="summary-card">

          <div className="card-label">
            Battery
          </div>

          <div className="card-value">
            {energyData.percentage.toFixed(
              0
            )}%
          </div>

          <div className="card-description">
            {energyData.availableBattery.toFixed(
              1
            )}{" "}
            kWh remaining
          </div>

        </div>


        {/* Daily Cost */}

        <div className="summary-card">

          <div className="card-label">
            Daily Cost
          </div>

          <div className="card-value">
            ${energyData.cost.toFixed(2)}
          </div>

          <div className="card-description">
            At $
            {energyData.electricityRate.toFixed(
              2
            )}
            /kWh
          </div>

        </div>

      </section>


      {/* =========================
          BATTERY + ENERGY USAGE
      ========================= */}

      <section className="dashboard-grid">

        {/* Battery */}

        <div className="dashboard-card battery-card">

          <div className="section-header">

            <div>

              <h2>
                Battery Status
              </h2>

              <p>
                Current household backup
                capacity
              </p>

            </div>

          </div>


          <div className="battery-content">

            <div className="battery-circle">

              <strong>
                {energyData.percentage.toFixed(
                  0
                )}
                %
              </strong>

              <span>
                charged
              </span>

            </div>


            <div className="battery-info">

              <div className="info-row">

                <span>
                  Capacity
                </span>

                <strong>
                  {energyData.capacity.toFixed(
                    1
                  )}{" "}
                  kWh
                </strong>

              </div>


              <div className="info-row">

                <span>
                  Available
                </span>

                <strong>
                  {energyData.availableBattery.toFixed(
                    1
                  )}{" "}
                  kWh
                </strong>

              </div>


              <div className="info-row">

                <span>
                  Efficiency
                </span>

                <strong>
                  {energyData.efficiency.toFixed(
                    0
                  )}
                  %
                </strong>

              </div>


              <div className="info-row">

                <span>
                  Runtime
                </span>

                <strong>
                  {energyData.runtime.toFixed(
                    1
                  )}{" "}
                  hrs
                </strong>

              </div>

            </div>

          </div>

        </div>


        {/* Energy Usage */}

        <div className="dashboard-card">

          <div className="section-header">

            <div>

              <h2>
                Energy Usage
              </h2>

              <p>
                Current household
                consumption
              </p>

            </div>

          </div>


          <div className="energy-chart">

            <div className="chart-y-axis">

              <span>
                3 kW
              </span>

              <span>
                2 kW
              </span>

              <span>
                1 kW
              </span>

              <span>
                0 kW
              </span>

            </div>


            <div className="chart-body">

              <div className="chart-grid">

                <div></div>
                <div></div>
                <div></div>
                <div></div>

              </div>


              <svg
                className="energy-line"
                viewBox="0 0 600 220"
                preserveAspectRatio="none"
              >

                <defs>

                  <linearGradient
                    id="energyGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >

                    <stop
                      offset="0%"
                      stopColor="#c62828"
                      stopOpacity="0.22"
                    />

                    <stop
                      offset="100%"
                      stopColor="#c62828"
                      stopOpacity="0"
                    />

                  </linearGradient>

                </defs>


                <path
                  d="
                    M 0 170
                    L 60 150
                    L 120 160
                    L 180 110
                    L 240 125
                    L 300 80
                    L 360 105
                    L 420 65
                    L 480 90
                    L 540 50
                    L 600 75
                    L 600 220
                    L 0 220
                    Z
                  "
                  fill="url(#energyGradient)"
                />


                <path
                  d="
                    M 0 170
                    L 60 150
                    L 120 160
                    L 180 110
                    L 240 125
                    L 300 80
                    L 360 105
                    L 420 65
                    L 480 90
                    L 540 50
                    L 600 75
                  "
                  fill="none"
                  stroke="#c62828"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

              </svg>


              <div className="chart-x-axis">

                <span>6 AM</span>
                <span>9 AM</span>
                <span>12 PM</span>
                <span>3 PM</span>
                <span>6 PM</span>
                <span>9 PM</span>

              </div>

            </div>

          </div>


          <div className="usage-footer">

            <div>

              <span>
                Today
              </span>

              <strong>
                {energyData.energy.toFixed(
                  1
                )}{" "}
                kWh
              </strong>

            </div>


            <div>

              <span>
                Daily Cost
              </span>

              <strong>
                ${energyData.cost.toFixed(
                  2
                )}
              </strong>

            </div>

          </div>

        </div>

      </section>


      {/* =========================
          ENERGY SUPPLY DETAILS
      ========================= */}

      <section className="dashboard-card">

        <div className="section-header">

          <div>

            <h2>
              Energy Supply
            </h2>

            <p>
              Current electricity supply
              capacity.
            </p>

          </div>

        </div>


        {!energyData.hasEnergySupply ? (

          <div className="empty-state">

            <strong>
              Energy supply not configured
            </strong>

            <span>
              Add an Energy Supply record
              before viewing supply capacity.
            </span>

          </div>

        ) : (

          <div className="battery-info">

            <div className="info-row">

              <span>
                Supply Capacity
              </span>

              <strong>
                {energyData.supplyKW.toFixed(
                  2
                )}{" "}
                kW
              </strong>

            </div>


            <div className="info-row">

              <span>
                Current Load
              </span>

              <strong>
                {(
                  energyData.power / 1000
                ).toFixed(2)}{" "}
                kW
              </strong>

            </div>


            <div className="info-row">

              <span>
                Remaining Capacity
              </span>

              <strong>
                {(
                  energyData.remainingSupply /
                  1000
                ).toFixed(2)}{" "}
                kW
              </strong>

            </div>


            <div className="info-row">

              <span>
                Supply Utilization
              </span>

              <strong>
                {energyData.supplyUtilization.toFixed(
                  0
                )}
                %
              </strong>

            </div>

          </div>

        )}

      </section>


      {/* =========================
          APPLIANCES
      ========================= */}

      <section className="dashboard-card appliances-overview">

        <div className="section-header">

          <div>

            <h2>
              Appliances
            </h2>

            <p>
              Your household's active
              appliances
            </p>

          </div>

        </div>


        {appliances.length === 0 ? (

          <div className="empty-state">

            <strong>
              No appliances found
            </strong>

            <span>
              Add appliances in the
              Simulator.
            </span>

          </div>

        ) : (

          <div className="appliance-list">

            {appliances.map(
              (appliance) => {

                const wattage =
                  Number(
                    appliance.wattage || 0
                  );

                return (
                  <div
                    className="appliance-row"
                    key={appliance.id}
                  >

                    <div className="appliance-icon">

                      {appliance.name
                        ?.slice(0, 2)
                        .toUpperCase()}

                    </div>


                    <div className="appliance-name">

                      <strong>
                        {appliance.name}
                      </strong>

                      <span>
                        {appliance.category}
                      </span>

                    </div>


                    <div className="appliance-usage">

                      {wattage.toLocaleString()} W

                    </div>


                    <div
                      className={
                        appliance.active
                          ? "appliance-status active-status"
                          : "appliance-status"
                      }
                    >

                      {appliance.active
                        ? "Active"
                        : "Standby"}

                    </div>

                  </div>
                );
              }
            )}

          </div>

        )}

      </section>

    </div>
  );
}

export default Dashboard;