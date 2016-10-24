v1.0.1 - Bugfix in instance.refresh(), instance.day, instance.month, instance.year not updating.

v1.0.2 - Bugfix options.headerFormat was being referenced internally as headerformat (casing), preventing it from being correctly applied.

v1.0.3 - Bugfix Move .day, .month, .year init from the _init method to the _buildOptions method. This allows the date to correctly update when calling buildOptions with a new initial: date. 

v1.0.4 - Bugfix Correctly target caption when adding ID. Lets table's aria-labelledby point to
caption. Previously was pointing to nothing.

v1.1.0 - Add activeDates option.
