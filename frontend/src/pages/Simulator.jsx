import { useEffect, useMemo, useState } from "react";
import API from "../api/api";
import { ELECTRICITY_RATE } from "../constants/energy";

function Simulator() {
  const [appliances, setAppliances] = useState([]);
  const [householdId, setHouseholdId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");

  /*
   * Load the active household and its appliances.
   */
  useEffect(() => {
    async function loadAppliances() {
      try {
        setLoading(true);
        setError("");

        // Get active household
        const householdResponse = await API.get(
          "/households/active/"
        );

        const household = householdResponse.data;

        if (!household?.id) {
          throw new Error("No active household found.");
        }

        const householdId = household.id;

        setHouseholdId(householdId);

        // Get appliances for that household
        const appliancesResponse = await API.get(
          `/households/${householdId}/appliances/`
        );

        setAppliances(
          Array.isArray(appliancesResponse.data)
            ? appliancesResponse.data
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load appliances:",
          error
        );

        setError(
          "Unable to load your appliances. Please make sure the backend is running."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAppliances();
  }, []);

  /*
   * Update local appliance state.
   */
  const updateAppliance = (id, field, value) => {
    setAppliances((current) =>
      current.map((appliance) => {
        if (appliance.id !== id) {
          return appliance;
        }

        return {
          ...appliance,
          [field]:
            field === "active"
              ? value
              : field === "name" ||
                field === "category"
                ? value
                : Number(value),
        };
      })
    );
  };

  /*
   * Save one appliance to Django.
   */
  const saveAppliance = async (appliance) => {
    if (!householdId) {
      return;
    }

    try {
      setSavingId(appliance.id);
      setError("");

      const response = await API.patch(
        `/households/${householdId}/appliances/${appliance.id}/`,
        {
          name: appliance.name,
          category: appliance.category,
          wattage: Number(appliance.wattage || 0),
          priority: Number(appliance.priority || 3),
          usage: Number(appliance.usage || 0),
          active: appliance.active,
        }
      );

      // Replace local appliance with Django response
      setAppliances((current) =>
        current.map((item) =>
          item.id === appliance.id
            ? response.data
            : item
        )
      );
    } catch (error) {
      console.error(
        "Failed to save appliance:",
        error
      );

      setError(
        "Unable to save appliance changes."
      );
    } finally {
      setSavingId(null);
    }
  };

  /*
   * Toggle appliance and immediately save it.
   */
  const toggleAppliance = async (appliance) => {
    const updatedAppliance = {
      ...appliance,
      active: !appliance.active,
    };

    setAppliances((current) =>
      current.map((item) =>
        item.id === appliance.id
          ? updatedAppliance
          : item
      )
    );

    await saveAppliance(updatedAppliance);
  };

  /*
   * Calculate household totals.
   */
  const totals = useMemo(() => {
    const activeAppliances = appliances.filter(
      (appliance) => appliance.active
    );

    // Current active power in watts
    const power = activeAppliances.reduce(
      (total, appliance) =>
        total +
        Number(appliance.wattage || 0),
      0
    );

    // Estimated daily energy in kWh
    const energy = activeAppliances.reduce(
      (total, appliance) =>
        total +
        (
          Number(appliance.wattage || 0) *
          Number(appliance.usage || 0)
        ) / 1000,
      0
    );

    // Electricity cost using the shared rate
    const cost =
      energy * ELECTRICITY_RATE;

    return {
      power,
      energy,
      cost,
    };
  }, [appliances]);

  /*
   * Loading state.
   */
  if (loading) {
    return (
      <div className="page simulator">
        <div className="page-header">
          <div>
            <h1>Appliance Simulator</h1>

            <p>
              Loading your household appliances...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page simulator">

      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <h1>Appliance Simulator</h1>

          <p>
            Experiment with your household appliances
            and see how configuration changes affect
            your energy usage.
          </p>
        </div>
      </div>

      {error && (
        <p className="form-error">
          {error}
        </p>
      )}

      {/* SUMMARY CARDS */}
      <section className="summary-grid">

        <div className="summary-card">
          <div className="card-label">
            Power Usage
          </div>

          <div className="card-value">
            {(totals.power / 1000).toFixed(2)} kW
          </div>

          <div className="card-description">
            Current active load
          </div>
        </div>


        <div className="summary-card">
          <div className="card-label">
            Energy Consumption
          </div>

          <div className="card-value">
            {totals.energy.toFixed(2)} kWh
          </div>

          <div className="card-description">
            Estimated daily consumption
          </div>
        </div>


        <div className="summary-card">
          <div className="card-label">
            Daily Cost
          </div>

          <div className="card-value">
            ${totals.cost.toFixed(2)}
          </div>

          <div className="card-description">
            At ${ELECTRICITY_RATE.toFixed(2)}/kWh
          </div>
        </div>

      </section>


      {/* APPLIANCES */}
      <section className="dashboard-card">

        <div className="section-header">
          <div>
            <h2>Your Appliances</h2>

            <p>
              Adjust your appliances to simulate
              different household configurations.
            </p>
          </div>
        </div>


        {appliances.length === 0 ? (

          <div className="empty-state">

            <div className="empty-icon">
              +
            </div>

            <strong>
              No appliances found
            </strong>

            <span>
              Add appliances to your household
              to use the simulator.
            </span>

          </div>

        ) : (

          <div className="simulator-table">

            {/* Table header */}

            <div className="simulator-header">
              <span>Appliance</span>
              <span>Wattage</span>
              <span>Usage</span>
              <span>Priority</span>
              <span>Status</span>
              <span>Save</span>
            </div>


            {/* Appliance rows */}

            {appliances.map((appliance) => {

              const appliancePower =
                Number(appliance.wattage || 0);

              const applianceUsage =
                Number(appliance.usage || 0);

              const applianceEnergy =
                appliance.active
                  ? (
                      appliancePower *
                      applianceUsage
                    ) / 1000
                  : 0;

              const applianceCost =
                applianceEnergy *
                ELECTRICITY_RATE;

              return (
                <div
                  className="simulator-row"
                  key={appliance.id}
                >

                  {/* Appliance */}

                  <div className="simulator-appliance">

                    <div className="appliance-icon">
                      {appliance.name
                        ?.slice(0, 2)
                        .toUpperCase()}
                    </div>

                    <div>
                      <strong>
                        {appliance.name}
                      </strong>

                      <span>
                        {appliance.category}
                      </span>
                    </div>

                  </div>


                  {/* Wattage */}

                  <div className="simulator-input">

                    <label>
                      Wattage
                    </label>

                    <div className="input-with-unit">

                      <input
                        type="number"
                        min="0"
                        value={appliance.wattage ?? 0}
                        onChange={(event) =>
                          updateAppliance(
                            appliance.id,
                            "wattage",
                            event.target.value
                          )
                        }
                      />

                      <span>W</span>

                    </div>

                  </div>


                  {/* Usage */}

                  <div className="simulator-input">

                    <label>
                      Hours / day
                    </label>

                    <input
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      value={appliance.usage ?? 0}
                      onChange={(event) =>
                        updateAppliance(
                          appliance.id,
                          "usage",
                          event.target.value
                        )
                      }
                    />

                  </div>


                  {/* Priority */}

                  <div className="simulator-input">

                    <label>
                      Priority
                    </label>

                    <select
                      value={appliance.priority ?? 3}
                      onChange={(event) =>
                        updateAppliance(
                          appliance.id,
                          "priority",
                          event.target.value
                        )
                      }
                    >

                      <option value={1}>
                        High
                      </option>

                      <option value={2}>
                        Medium
                      </option>

                      <option value={3}>
                        Low
                      </option>

                    </select>

                  </div>


                  {/* Power toggle */}

                  <div className="simulator-status">

                    <button
                      type="button"
                      className={
                        appliance.active
                          ? "power-toggle on"
                          : "power-toggle"
                      }
                      disabled={
                        savingId === appliance.id
                      }
                      onClick={() =>
                        toggleAppliance(appliance)
                      }
                    >

                      <span className="toggle-dot" />

                      {appliance.active
                        ? "ON"
                        : "OFF"}

                    </button>

                  </div>


                  {/* Save */}

                  <div>

                    <button
                      type="button"
                      className="secondary-button"
                      disabled={
                        savingId === appliance.id
                      }
                      onClick={() =>
                        saveAppliance(appliance)
                      }
                    >

                      {savingId === appliance.id
                        ? "Saving..."
                        : "Save"}

                    </button>

                  </div>


                  {/* Calculated values */}

                  <div className="simulator-results">

                    <div>
                      <span>
                        Power
                      </span>

                      <strong>
                        {appliance.active
                          ? `${appliancePower.toLocaleString()} W`
                          : "0 W"}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Energy
                      </span>

                      <strong>
                        {appliance.active
                          ? `${applianceEnergy.toFixed(2)} kWh`
                          : "0 kWh"}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Cost
                      </span>

                      <strong>
                        {appliance.active
                          ? `$${applianceCost.toFixed(2)}`
                          : "$0.00"}
                      </strong>
                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </section>


      {/* CONFIGURATION IMPACT */}

      <section className="dashboard-card comparison-card">

        <div className="section-header">

          <div>

            <h2>
              Configuration Impact
            </h2>

            <p>
              See how your current configuration
              compares with an optimized one.
            </p>

          </div>

        </div>


        <div className="comparison-grid">

          {/* Current */}

          <div className="comparison-column">

            <span className="comparison-label">
              Current Configuration
            </span>

            <strong>
              {(totals.power / 1000).toFixed(2)} kW
            </strong>

            <span>
              {totals.energy.toFixed(2)} kWh/day
            </span>

            <span>
              ${totals.cost.toFixed(2)}/day
            </span>

          </div>


          {/* Arrow */}

          <div className="comparison-arrow">
            →
          </div>


          {/* Optimized */}

          <div className="comparison-column">

            <span className="comparison-label">
              Optimized Configuration
            </span>

            <strong className="accent-text">
              Coming Soon
            </strong>

            <span>
              Use the Optimization page to
              generate recommendations.
            </span>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Simulator;