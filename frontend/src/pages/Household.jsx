import { useEffect, useState } from "react";
import API from "../api/api";

function Household() {
  const [household, setHousehold] = useState({
    id: null,
    name: "",
    type: "single-family",
  });

  const [battery, setBattery] = useState({
    id: null,
    name: "",
    capacity: 0,
    current_percentage: 0,
    efficiency: 0,
    max_discharge: 0,
    active: false,
  });

  const [electricity, setElectricity] = useState({
    id: null,
    wattage: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHouseholdData() {
      try {
        setLoading(true);
        setError("");

        // Get the currently active household
        const activeResponse = await API.get(
          "/api/households/active/"
        );

        const activeHousehold = activeResponse.data;

        setHousehold(activeHousehold);

        const householdId = activeHousehold.id;

        // Get battery data
        const batteryResponse = await API.get(
          `/api/households/${householdId}/batteries/`
        );

        if (batteryResponse.data.length > 0) {
          setBattery(batteryResponse.data[0]);
        }

        // Get electricity supply data
        const energyResponse = await API.get(
          `/api/households/${householdId}/energy-supply/`
        );

        setElectricity(energyResponse.data);
      } catch (err) {
        console.error("Failed to load household:", err);

        setError(
          "Unable to load household information."
        );
      } finally {
        setLoading(false);
      }
    }

    loadHouseholdData();
  }, []);

  const updateHousehold = (field, value) => {
    setHousehold((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateBattery = (field, value) => {
    setBattery((current) => ({
      ...current,
      [field]: Number(value),
    }));
  };

  const updateElectricity = (field, value) => {
    setElectricity((current) => ({
      ...current,
      [field]: Number(value),
    }));
  };

  async function saveChanges() {
    try {
      setError("");

      const householdId = household.id;

      // Update household
      await API.patch(
        `/api/households/${householdId}/`,
        {
          name: household.name,
          type: household.type,
        }
      );

      // Update battery
      if (battery.id) {
        await API.patch(
          `/api/households/${householdId}/batteries/${battery.id}/`,
          {
            name: battery.name,
            capacity: battery.capacity,
            current_percentage:
              battery.current_percentage,
            efficiency: battery.efficiency,
            max_discharge:
              battery.max_discharge,
            active: battery.active,
          }
        );
      }

      // Update electricity supply
      if (electricity.id) {
        await API.patch(
          `/api/households/${householdId}/energy-supply/`,
          {
            wattage: electricity.wattage,
          }
        );
      }

      alert("Changes saved successfully.");
    } catch (err) {
      console.error("Failed to save household:", err);

      setError(
        "Unable to save your changes."
      );
    }
  }

  if (loading) {
    return (
      <div className="page household">
        <div className="page-header">
          <div>
            <h1>Household Settings</h1>
            <p>Loading your household...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page household">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Household Settings</h1>

          <p>
            Manage your household, battery, and
            electricity configuration.
          </p>
        </div>
      </div>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      {/* Household */}
      <section className="dashboard-card settings-card">

        <div className="section-header">
          <div>
            <h2>Household</h2>

            <p>
              Basic information about your household.
            </p>
          </div>
        </div>

        <div className="settings-grid">

          <div className="settings-field">
            <label>Household Name</label>

            <input
              type="text"
              value={household.name}
              onChange={(event) =>
                updateHousehold(
                  "name",
                  event.target.value
                )
              }
            />
          </div>

          <div className="settings-field">
            <label>Household Type</label>

            <select
              value={household.type}
              onChange={(event) =>
                updateHousehold(
                  "type",
                  event.target.value
                )
              }
            >
              <option value="single-family">
                Single Family
              </option>

              <option value="apartment">
                Apartment
              </option>

              <option value="townhouse">
                Townhouse
              </option>

              <option value="other">
                Other
              </option>
            </select>
          </div>

        </div>

      </section>

      {/* Battery */}
      <section className="dashboard-card settings-card">

        <div className="section-header">
          <div>
            <h2>Battery</h2>

            <p>
              Configure your household backup battery.
            </p>
          </div>
        </div>

        <div className="settings-grid">

          <div className="settings-field">
            <label>Battery Capacity</label>

            <div className="settings-unit-input">
              <input
                type="number"
                min="0"
                step="0.1"
                value={battery.capacity}
                onChange={(event) =>
                  updateBattery(
                    "capacity",
                    event.target.value
                  )
                }
              />

              <span>kWh</span>
            </div>
          </div>

          <div className="settings-field">
            <label>Current Battery</label>

            <div className="settings-unit-input">
              <input
                type="number"
                min="0"
                max="100"
                value={battery.current_percentage}
                onChange={(event) =>
                  updateBattery(
                    "current_percentage",
                    event.target.value
                  )
                }
              />

              <span>%</span>
            </div>
          </div>

          <div className="settings-field">
            <label>Inverter Efficiency</label>

            <div className="settings-unit-input">
              <input
                type="number"
                min="0"
                max="100"
                value={battery.efficiency}
                onChange={(event) =>
                  updateBattery(
                    "efficiency",
                    event.target.value
                  )
                }
              />

              <span>%</span>
            </div>
          </div>

          <div className="settings-field">
            <label>Maximum Discharge</label>

            <div className="settings-unit-input">
              <input
                type="number"
                min="0"
                step="0.1"
                value={battery.max_discharge}
                onChange={(event) =>
                  updateBattery(
                    "max_discharge",
                    event.target.value
                  )
                }
              />

              <span>kW</span>
            </div>
          </div>

        </div>

      </section>

      {/* Electricity */}
      <section className="dashboard-card settings-card">

        <div className="section-header">
          <div>
            <h2>Electricity</h2>

            <p>
              Configure your household energy supply.
            </p>
          </div>
        </div>

        <div className="settings-grid">

          <div className="settings-field">
            <label>Energy Supply</label>

            <div className="settings-unit-input">
              <input
                type="number"
                min="0"
                step="0.1"
                value={electricity.wattage}
                onChange={(event) =>
                  updateElectricity(
                    "wattage",
                    event.target.value
                  )
                }
              />

              <span>W</span>
            </div>
          </div>

        </div>

      </section>

      {/* Appliance information */}
      <section className="dashboard-card settings-card">

        <div className="section-header">

          <div>
            <h2>Appliance Data</h2>

            <p>
              Appliance information can be edited
              from the Simulator.
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={() =>
              window.location.href = "/simulator"
            }
          >
            Edit Appliances
          </button>

        </div>

      </section>

      {/* Save */}
      <div className="settings-footer">
        <button
          className="primary-button"
          onClick={saveChanges}
        >
          Save Changes
        </button>
      </div>

    </div>
  );
}

export default Household;