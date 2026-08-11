# runtime calculator
def Calculate_Runtime(battery_capacity, circut_current):
    maximum_runtime = battery_capacity / circut_current
    estimated_runtime = maximum_runtime * 0.8
    return estimated_runtime
    # Note: The units must always be the same for example Ah and A or mAh and mA