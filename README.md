
# React apollo testing mock generator

This packages generates mock responses based on your graphql query, in order to test your React component with  `MockedProvider`. 

## Configuration

To initialise your config run:

    mock-gen --init

Select your file extension preference, and provide the path to your schema file.
ex. `./App/frontend/graphql/schema.graphql`.

In your applications root folder `mock-generator.config.js` will be generated up on initialisation.

## This is how it works

Get your `.gql` files relative path and run:

    mock-gen ./App/frontend/Contact/graphql/contact.gql // <- your path

 


## More on configuration
`aliasPaths` - an Object, defines you alias paths (if you use any) to help resolve fragments. 
ex:

    aliasPaths: {
	    "@yourAlias": './App/frontend'
    },


`lint` - a function returns a string with your preferred lint command to format the generated file. 

    lint: (path) => `yarn eslint ${path} --fix`,

`includeTypenames` - a boolean whether you prefer the mock with typenames or without.
`resolvers` - an Object defines all primitive grapqhl types and the way to resolve them (ex: with Faker.js).

    resolvers: {
		String: {
			age: () => '23',
			name: () => "Josh Doe",
			default: () => 'random text'
		},
		etc...
		ScalarTypeDefinition: {
			// here comes your scalar definitions
			Date: {
				defualt: () => '2020-02-02'
			}
		},
	}

## Disclaimer

This package is still under development.
The current version includes:

 - resolving fragments
 - resolving typenames
 - resolving alias paths
 - only works with `.gql` files
 - only works with one query defined


