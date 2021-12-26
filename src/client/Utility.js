class Utility
{
    /**
     * Adds the given property name and value to the given object. 
     * Supports multi-object property names; for example 'user.firstName'.
     * Supports adding multiple values to the same property by converting it to an array.
     * 
     * @param {object} object - The object to add the property to.
     * @param {string} name - The name of the property.
     * @param {*} value - The value to set the property to.
     * 
     * @returns {object} Returns the given object.
     */
    static setProperty (object, name, value)
    {
        // If the name contains '.' to check if we need to split up first.
        if (name.indexOf('.') !== -1)
        {
            // Split the name and add each part of it. Remove the last name to be added as the value.
            const names = name.split('.');
            const subName = names.pop();

            // Traverse the names and add them as objects to the value.
            let subObject = object;
            for (let subName of names)
            {
                // If the property does not already exist then add it.
                if (!subObject.hasOwnProperty(subName)) subObject[subName] = {};

                // Get the sub property object.
                subObject = subObject[subName];
            }

            // At this point the subObject is where we need to the set the name and value to. Add the name and value to the sub object.
            this.setProperty(subObject, subName, value);
        }
        // Otherwise set the value to the property within the given object.
        else object[name] = value;

        // Return the given object.
        return object;
    }

}