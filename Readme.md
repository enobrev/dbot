# BaobabComponent

Both the frontend and backends rely upon the [Baobab library](https://github.com/Yomguithereal/baobab), which is a simple, yet powerful immutable data tree with cursors.  While Baobab has it's own "react-baobab" component meant for tracking cursors per component, I needed additional functionality.
 
## Our Data and Our API

Before I continue, let me quickly explain how we're using Baobab.  Our API _always_ returns data in the same format: as hashes with Primary Key indexes.  This makes syncing and merging our data much easier and allows us to automatically index our data in the client by primary key, which is especially useful, when you need to retrieve adjoined data (like getting a theme by theme_id).  API Responses look something like this:

```javascript

    {
        _metaData: {
            /* ... */
        },
        table1: {
            primary_key1: {
                /* ... */
            },
            primary_key2: {
                /* ... */
            }
        },
        table2: {
            primary_key3: {
                /* ... */
            },
            primary_key4: {
                /* ... */
            }
        }
    }
    
```

Even if you're querying a single record, let's say the user with the id 3, the response will look like this:

```javascript

    {
        _metaData: {
            /* ... */
        },
        users: {
            '3': {
                id: 3,
                name: 'whatever',
                and: 'so on'
            }
        }
    }
    
```

This may seem odd at first, but there are benefits.  First and foremost, the consistency means we can act upon the data with the same methods every time.  We don't need to try to figure out if it's an object, or an array, or if it's a single record, or multiple records.  Instead we get a fully formatted set of one ore more records that we can just merge into our local data store without manipulation.  Fast and Easy.  And so our local data store looks exactly the same, except for one specific difference.  We keep two copies of our data: "server" and "local".

So every time we get an API response, we call `Data.mergeResponse(oResponse)`, which loops through, skips the metadata and merges the data twice - once into a "server" object, and once into "local".  After `Data.mergeResponse` on our user query, our local data store will look like this:

```javascript

    Data: {
        server: {
            users: {
                '3': {
                    id: 3,
                    name: 'whatever',
                    and: 'so on'
                }
            }
        },
        local: {
            users: {
                '3': {
                    id: 3,
                    name: 'whatever',
                    and: 'so on'
                }
            }
        }
    }
    
```

Why the hell- !?!  Very simple - we now have a record of what our data looks like on the server, and we have a "local" copy that we can modify.  And if we want to, say, sync our local data against the server, it's very easy to see what data has changed and only send what's new (or remove what's gone).

What that means is that we _never_ touch the "server" data besides to check against it.  It's meant to be held as a pristine cache of what we last heard is on the server.  And then after a user uses the app a bit, it's very easy for us to, for instance, check if there are any changes, and if so, show a "save" button, or warn a user that closing the browser will lose their unsaved data.

## Back to our Component

Of course, javascript doesn't have a "map" or "filter" method for objects.  Likewise, one or two "filter" methods in a render is easily forgettable, but as an application gets more and more complex, we find our selves modifying our data more and more on the fly, and with react, this means we're doing it over and over again as the interface updates, even as we type into input fields.

The solution within BaobabComponent is to _only_ modify data at the moment it is changed, and then the render methods use the modified data.  The data lifecycle is very simple:

```text

   baobab update => data adjustments => this.setState(adjusted data) 
   
```

And after that, render() only ever works with state data.  No filters, or `Object.values()`, or anything while rendering

This is all done by having our component extend common/BaobabComponent, and then overriding one method, called `stateQueries`.  This method defines the data we're watching and how it should be modified over time.  Here is a simple example without any data modifications.

```javascript

    class MyClass extends BaobabComponent {

        stateQueries() {
            return {
                me:        ['local', 'me'],
                base_url:  ['local', 'config', 'URI_WWW'],
                height:    ['state', 'www', 'DOM', 'height'],
                mobile:    ['state', 'www', 'DOM', 'mobile'],
                OS:        ['state', 'www', 'DOM', 'OS'],
                subject:   ['state', 'www', 'ask', 'subject'],
                message:   ['state', 'www', 'ask', 'message']
            }
        }
        
        render() {
            /* ... */
        }
    }
    
```

What you see above are merely Baobab Cursor Queries.  The arrays are a little weird.  So let's look at an example of what this data would look like:

```javascript

    // If you look in js/Data.js, you'll see something very much like this example.
    
    Data = {
        server: {
            me: { 
                '3': {
                    id: 3,
                    name: 'whatever',
                    and: 'so on'
                }
            },
        },
        local: {
            me: { 
                '3': {
                    id: 3,
                    name: 'whatever',
                    and: 'so on'
                }
            },
            config: {
                URI_WWW: 'whatever'
            }
        },
        state: {
            www: {
                DOM: {
                    width: 1200,
                    height: 1200,
                    mobile: true,
                    OS: 'AndroidOS'
                },
                ask: {
                    subject: 'whatever',
                    message: 'whatever'
                }
            }
        }
    }
    
```

Now, just as an example, look at the arrays above in `stateQueries`, but instead of arrays, picture it like this (which i may implement):
    
```javascript

    return {
        me:        'local.me',
        base_url:  'local.config.URI_WWW',
        height:    'state.www.DOM.height',
        mobile:    'state.www.DOM.mobile',
        OS:        'state.www.DOM.OS',
        subject:   'state.www.ask.subject',
        message:   'state.www.ask.message'
    }
    
```

The `stateQueries` gives us an object full of "cursor paths", which baobab will then "watch" for changes, and then set our current state to the values in each of those paths.

So, for instance, once a user logs in, Data.local.me is updated with the user's data from the API.  Since we're subscribed to it, that means that this will be called immediately once that data has been updated:

```javascript

    this.setState(
        {
            me: {
                id: 1,
                name: 'Mark',
                type: 'Developer'
            }
        }
    );

```

As is standard, once `setState` is called, your component will be re-rendered with the new data in `this.state.me`.

That's it.  Every time our data is updated, anything our component is subscribed to (anything in `stateQueries`) will update the current component's state, and hence, fire a render with an updated `this.state`.  The state vars are named after the queries.

There is one immediate downside:  We lose control over our own state object (no more `setState` and no more `this.state = {}` in the constructor).  There's probably a way around it.  But thus far, it hasn't been an issue, and, as a matter of fact, can even be a benefit.

Instead, we store our state in the "state" section of Data.js, and then add queries to watch it.  Once nice thing about that is we can "watch" the state of other components as well, like our "APP" state or "DOM" state which are meant to be used globally.

## Cursors

All well and good, and now you can watch data, and you can update data from API calls.  But how do we update the data store directly?  

`stateQueries` sets up new cursors for us as well, so not only can we watch the data in said cursors, but we can call update methods upon them as well.

For the plain definitions as shown in the above example, they will all have cursors.  In a more advanced setup, which includes data modifications, it will set up a cursor for every stateQuery that has a "cursor" property.  More on that in a bit.

For the above example, I can do something like:

```javascript

    class MyClass extends BaobabComponent {
        updateDimensions(width, height) {
            this.CURSORS.width.set(width);
            this.CURSORS.height.set(height);
        }
        
        render() {
            return (
                <div style={{width: this.state.width, height: this.state.height}} />
            )
        }
    }
    
```

The cursors in the `this.CURSORS` object have the same name as the properties in `stateQueries`.  Each one is a cursor.  So you can have a cursor / watch that points to the whole "me" object, or you can even have one that only points at "me.name" (['local', 'me', 'name']), and that cursor will only watch / modify that specific property.

## Modifying State

That's the set-up, and the basic usage.  This next part isn't required, but is meant as an optimization.  One of the problems, as stated above, with modifying data upon render is that those modifications add up.  Calling Object.values(oObject).filter(someMethod).sort() every time someone presses a key on an input becomes a problem very quickly.   We don't need to run that filter every time.  Just once - when the data comes in, or when the applicable data changes.

That leads us to the more advanced stateQueries, which also designate a `setState` property, which requires a function.  This method is a hook that runs just before new data in a cursor is added to the state.  It's called for every cursor that has changed, and allows you to modify the state even further.  It does _not_ change the cursor data, only the state.

An example:


```javascript

    class MyClass extends BaobabComponent {

        stateQueries() {
            return {
                cities:    {
                    cursor: ['local', 'cities'],
                    setState: oState => oState.chicago = Object.values(oCities).filter(oCity => oCity.name == 'Chicago').pop()
                },
                guides:    {
                    cursor: ['local', 'guides'],
                    setState: oState => oState.chicago_guides = Object.values(oState.guides).filter(oGuide => oGuide.city_id == oState.chicago.id)
                }
            }
        }
        
        render() {
            this.state.chicago_guides.map(oGuide => <div>{oGuide.name}</div>)
        }
        
        componentWillMount() {
            API.query(['cities', 'guides'], (oError, oResponse) => Data.mergeResponse(oResponse));
        }
    }
    
```

Let's walk through what's happening here (this is obviously contrived and sans error-checking).

1. MyClass Mounts and we query the API for cities and guides, (obviously an example, that could be a huge query).
2. The API Response is Merged into Data.
3. Since we've designated a setState method for cities and guides, `setState` is called for each property once updated.
4. When it's called for 'cities', we add a new state property called `chicago`, which holds the record that has a `name` value of "Chicago".
5. When it's called for 'guides', we add a new state property called 'chicago_guides', which holds all the guides that have the `city_id` from `chicago`.
6. Finally, all that data is saved into the component's state in the background.
7. During `render`, we loop through our `chicago_guides` array.

An additional note: `oState` in the `setState` methods is cumulative.  So it will hold values that have been set by previous calls to `setState`, as demonstrated above.  This is why in `guides.setState`, we can access `oState.chicago` and expect it to have the most up-to-date value.  That said, it does so without any intelligence, so if they happen in the wrong order, things might get weird.  So if your setState method relies upon another state property, it's a good idea to ensure that state property is handled further up the list.

## Passive Updates

There are cases where we don't necessarily want to re-render when data is changed, but we might want to either maintain a cursor for a specific query, or even generate some data based on a cursor, while not necessarily updating the render for actual cursor changes.  For this there is a boolean property called `invokeRender`, which defaults to `true`.

The default means that changes to any `stateQueries` watches will invoke a re-render of the current component.  If set to false, the watches will become passive.

```javascript

    class MyClass extends BaobabComponent {

        stateQueries() {
            return {
                cities:    {
                    cursor:         ['local', 'cities'],
                    invokeRender:   false,
                    setState:       oState => oState.chicago = Object.values(oCities).filter(oCity => oCity.name == 'Chicago').pop()
                },
                guides:    {
                    cursor:     ['local', 'guides'],
                    setState:   oState => oState.chicago_guides = Object.values(oState.guides).filter(oGuide => oGuide.city_id == oState.chicago.id)
                    onUpdate:   oState => console.log('Chicago Guides have been updated', oState.chicago_guides)
                }
            }
        }
    }
    
```

This example above will not invoke a new render when the "cities" Data has changed, but next time "guides" changes, it will have the correct `oState.chicago` data.

This is generally used for optimization and shouldn't really be a concern until that point.

## Aftermath

There is one more `stateQuery` property called `onUpdate`.  This will be called after the state has been updated for the component.  Here's what that looks like:

```javascript

    class MyClass extends BaobabComponent {

        stateQueries() {
            return {
                cities:    {
                    cursor: ['local', 'cities'],
                    setState: oState => oState.chicago = Object.values(oCities).filter(oCity => oCity.name == 'Chicago').pop()
                },
                guides:    {
                    cursor: ['local', 'guides'],
                    setState: oState => oState.chicago_guides = Object.values(oState.guides).filter(oGuide => oGuide.city_id == oState.chicago.id)
                    onUpdate: oState => console.log('Chicago Guides have been updated', oState.chicago_guides)
                }
            }
        }
    }
    
```

## Cui bono

* No unnecessary data modifications during render
* All our data modification happens in one place, which is easier to think about in a "stateful" manner
* All our data modification happens _only_ when the applicable data is updated
* Renders are only fired by applicable data updates, _after_ we've had a chance to adjust it