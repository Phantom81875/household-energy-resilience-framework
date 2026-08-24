import { useMemo, useState } from "react";

const initialAppliances = [
  {
    id: 1,
    name: "Television",
    wattage: 120,
    usage: 4,
    priority: 2,
    active: true,
  },
  {
    id: 2,
    name: "Air Conditioner",
    wattage: 1200,
    usage: 6,
    priority: 1,
    active: true,
  },
  {
    id: 3,
    name: "Refrigerator",
    wattage: 180,
    usage: 24,
    priority: 1,
    active: true,
  },
  {
    id: 4,
    name: "Laptop",
    wattage: 65,
    usage: 5,
    priority: 3,
    active: false,
  },
];

const ELECTRICITY_RATE = 0.16;

function Optimization() {
  const [goal, setGoal] = useState("maximum-runtime");
  const [powerLimit, setPowerLimit] = useState(2.5);
  const [targetRuntime, setTargetRuntime] = useState(8);
  const [recommendations, setRecommendations] = useState([]);

  const [appliances] = useState(initialAppliances);

  const currentPower = useMemo(() => {
    return appliances
      .filter((appliance) => appliance.active)
      .reduce(
        (total, appliance) =>
          total + appliance.wattage,
        0
      );
  }, [appliances]);

  const currentEnergy = useMemo(() => {
    return appliances
      .filter((appliance) => appliance.active)
      .reduce(
        (total, appliance) =>
          total +
          (appliance.wattage * appliance.usage) /
            1000,
        0
      );
  }, [appliances]);

  const currentCost =
    currentEnergy * ELECTRICITY_RATE;

  const generateRecommendations = () => {
    const results = [];

    if (goal === "maximum-runtime") {
      results.push({
        id: 1,
        appliance: "Air Conditioner",
        change: "Reduce usage: 6 → 4 hr",
        runtime: "+0.7 hr",
        energy: "1.2 kWh",
        cost: "$0.19/day",
      });

      results.push({
        id: 2,
        appliance: "Television",
        change: "Reduce usage: 4 → 2 hr",
        runtime: "+0.2 hr",
        energy: "0.24 kWh",
        cost: "$0.04/day",
      });
    }

    if (goal === "power-limit") {
      results.push({
        id: 1,
        appliance: "Air Conditioner",
        change: "Reduce usage: 6 → 4 hr",
        runtime: "+0.7 hr",
        energy: "1.2 kWh",
        cost: "$0.19/day",
      });
    }

    if (goal === "target-runtime") {
      results.push({
        id: 1,
        appliance: "Television",
        change: "Reduce usage: 4 → 2 hr",
        runtime: "+0.2 hr",
        energy: "0.24 kWh",
        cost: "$0.04/day",
      });

      results.push({
        id: 2,
        appliance: "Air Conditioner",
        change: "Reduce usage: 6 → 4 hr",
        runtime: "+0.7 hr",
        energy: "1.2 kWh",
        cost: "$0.19/day",
      });
    }

    setRecommendations(results);
  };

  return (
    <div className="page optimization">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Optimization</h1>

          <p>
            Find a configuration that better matches
            your household energy goals.
          </p>
        </div>
      </div>

      {/* Current system */}
      <section className="summary-grid">

        <div className="summary-card">
          <div className="card-label">
            Current Power
          </div>

          <div className="card-value">
            {(currentPower / 1000).toFixed(2)} kW
          </div>

          <div className="card-description">
            Active household load
          </div>
        </div>

        <div className="summary-card">
          <div className="card-label">
            Daily Energy
          </div>

          <div className="card-value">
            {currentEnergy.toFixed(2)} kWh
          </div>

          <div className="card-description">
            Estimated consumption
          </div>
        </div>

        <div className="summary-card">
          <div className="card-label">
            Daily Cost
          </div>

          <div className="card-value">
            ${currentCost.toFixed(2)}
          </div>

          <div className="card-description">
            At ${ELECTRICITY_RATE.toFixed(2)}/kWh
          </div>
        </div>

      </section>

      {/* Goal selection */}
      <section className="dashboard-card">

        <div className="section-header">
          <div>
            <h2>Optimization Goal</h2>

            <p>
              Choose what you want the optimizer
              to prioritize.
            </p>
          </div>
        </div>

        <div className="optimization-options">

          <label
            className={
              goal === "maximum-runtime"
                ? "optimization-option selected"
                : "optimization-option"
            }
          >
            <input
              type="radio"
              name="goal"
              value="maximum-runtime"
              checked={goal === "maximum-runtime"}
              onChange={(event) =>
                setGoal(event.target.value)
              }
            />

            <div>
              <strong>Maximum Runtime</strong>
              <span>
                Keep your battery running for as
                long as possible.
              </span>
            </div>
          </label>

          <label
            className={
              goal === "target-runtime"
                ? "optimization-option selected"
                : "optimization-option"
            }
          >
            <input
              type="radio"
              name="goal"
              value="target-runtime"
              checked={goal === "target-runtime"}
              onChange={(event) =>
                setGoal(event.target.value)
              }
            />

            <div>
              <strong>Target Runtime</strong>
              <span>
                Reach a specific backup runtime.
              </span>
            </div>
          </label>

          <label
            className={
              goal === "power-limit"
                ? "optimization-option selected"
                : "optimization-option"
            }
          >
            <input
              type="radio"
              name="goal"
              value="power-limit"
              checked={goal === "power-limit"}
              onChange={(event) =>
                setGoal(event.target.value)
              }
            />

            <div>
              <strong>Power Limit</strong>
              <span>
                Keep household power below a limit.
              </span>
            </div>
          </label>

        </div>

        {/* Goal-specific input */}
        {goal === "target-runtime" && (
          <div className="optimization-input">
            <label>Target Runtime</label>

            <div className="input-with-unit">
              <input
                type="number"
                min="1"
                value={targetRuntime}
                onChange={(event) =>
                  setTargetRuntime(event.target.value)
                }
              />

              <span>hours</span>
            </div>
          </div>
        )}

        {goal === "power-limit" && (
          <div className="optimization-input">
            <label>Maximum Power</label>

            <div className="input-with-unit">
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={powerLimit}
                onChange={(event) =>
                  setPowerLimit(event.target.value)
                }
              />

              <span>kW</span>
            </div>
          </div>
        )}

        <button
          className="primary-button"
          onClick={generateRecommendations}
        >
          Generate Recommendations
        </button>

      </section>

      {/* Recommendations */}
      <section className="dashboard-card">

        <div className="section-header">
          <div>
            <h2>Recommendations</h2>

            <p>
              Review the expected impact before
              applying any changes.
            </p>
          </div>
        </div>

        {recommendations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              ⚡
            </div>

            <strong>
              No recommendations yet
            </strong>

            <span>
              Choose an optimization goal and
              generate recommendations.
            </span>
          </div>
        ) : (
          <div className="recommendation-list">

            {recommendations.map(
              (recommendation) => (
                <div
                  className="recommendation-card"
                  key={recommendation.id}
                >

                  <div className="recommendation-main">

                    <span className="recommendation-tag">
                      Suggested Change
                    </span>

                    <h3>
                      {recommendation.appliance}
                    </h3>

                    <p>
                      {recommendation.change}
                    </p>

                  </div>

                  <div className="recommendation-impact">

                    <div>
                      <span>Runtime gained</span>
                      <strong>
                        {recommendation.runtime}
                      </strong>
                    </div>

                    <div>
                      <span>Energy saved</span>
                      <strong>
                        {recommendation.energy}
                      </strong>
                    </div>

                    <div>
                      <span>Cost saved</span>
                      <strong>
                        {recommendation.cost}
                      </strong>
                    </div>

                  </div>

                  <div className="recommendation-actions">

                    <button className="primary-button">
                      Apply
                    </button>

                    <button className="secondary-button">
                      Ignore
                    </button>

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </section>

    </div>
  );
}

export default Optimization;