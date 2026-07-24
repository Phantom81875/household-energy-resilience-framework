def get_categories(database):

    categories = set()

    for appliance in database.values():
        categories.add(appliance["category"])

    return sorted(categories)
