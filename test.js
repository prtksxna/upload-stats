// Code from http://www.codeproject.com/Articles/693841/Making-Dashboards-with-Dc-js-Part-1-Using-Crossfil
function print_filter(filter){
	var f=eval(filter);
	if (typeof(f.length) != "undefined") {}else{}
	if (typeof(f.top) != "undefined") {f=f.top(Infinity);}else{}
	if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);}else{}
	console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
}

// Code from https://github.com/dc-js/dc.js/wiki/FAQ#remove-empty-bins
function remove_empty_bins(source_group) {
    return {
        all:function () {
            return source_group.all().filter(function(d) {
                return d.value != 0;
            });
        }
    };
}

d3.csv( "everyone.csv", function ( evs ) {
	d3.csv( "newusers.csv", function ( nus ) {
		// date, tool, quality, user_type, count
		var data = [];
		var tools = [
			'crosswikiupload',
			'uploadwizard',
			'gwtoolset',
			'vicuna',
			'magnusoauth',
			'androidapp',
			'iosapp',
			'other'
		];

		var parseDate = d3.time.format("%Y-%m-%d").parse;
		nus.forEach( function ( nu, i ) {

			var ev = evs[ i ];
			tools.forEach( function ( tool ) {
				data.push( {
					date: parseDate( nu.date ),
					tool: tool,
					quality: 'good',
					userType: 'new',
					count: +nu[ tool + '_good' ]
				} );
				data.push( {
					date: parseDate( nu.date ),
					tool: tool,
					quality: 'bad',
					userType: 'new',
					count: +nu[ tool + '_bad' ]
				} );
				data.push( {
					date: parseDate( nu.date ),
					tool: tool,
					quality: 'good',
					userType: 'old',
					count: parseInt( ev[ tool + '_good'] ) - parseInt( nu[ tool + '_good' ] )
				} );
				data.push( {
					date: parseDate( nu.date ),
					tool: tool,
					quality: 'bad',
					userType: 'old',
					count: parseInt( ev[ tool + '_bad'] ) - parseInt( nu[ tool + '_bad' ] )
				} );
			} );
		} );
		makeViz( data );
	} );
} );

function makeViz ( data ) {
var ndx = crossfilter( data );

var dateDim = ndx.dimension( dc.pluck( 'date' ) );
var toolDim = ndx.dimension( dc.pluck( 'tool' ) );
var qualityDim = ndx.dimension( dc.pluck( 'quality' ) );
var userTypeDim = ndx.dimension( dc.pluck( 'userType' ) );

var uploadPerDate = dateDim.group().reduceSum( dc.pluck( 'count' ) );
var uploadPerTool = toolDim.group().reduceSum( dc.pluck( 'count' ) );
var uploadPerQuality = qualityDim.group().reduceSum( dc.pluck( 'count' ) );
var uploadPerUserType = userTypeDim.group().reduceSum( dc.pluck( 'count' ) );

var uploadChart = dc.lineChart( '#uploads' )
	.width( 1200 )
	.height( 200 )
	.dimension( dateDim )
	.group( uploadPerDate )
	.x( d3.time.scale().domain( [ dateDim.bottom(1)[0].date, dateDim.top(1)[0].date ] ) )
	.elasticY( true )
	.yAxisLabel( "Uploads" );

var qualityPie = dc.pieChart( '#quality' )
	.colors( d3.scale.category10() )
	.width( 200 )
	.height( 200 )
	.dimension( qualityDim )
	.title( function ( d ) {
		return d.key;
	} )
	.group( uploadPerQuality );

var toolPie = dc.pieChart( '#tool' )
	.colors( d3.scale.category10() )
	.width( 200 )
	.height( 200 )
	.dimension( toolDim )
	.title( function ( d ) {
		return d.key;
	} )
	.group( uploadPerTool );

var userPie = dc.pieChart( '#user' )
	.colors( d3.scale.category10() )
	.width( 200 )
	.height( 200 )
	.dimension( userTypeDim )
	.title( function ( d ) {
		return d.key;
	} )
	.group( uploadPerUserType );

dc.renderAll();

/*
var typeDim = ndx.dimension( dc.pluck( 'caseType' ) );
var callsPerType = typeDim.group().reduceSum( dc.pluck( 'count' ) );

var typeOfCall = dc.pieChart( '#type' )
	.colors( d3.scale.category10() )
	.width( 200 )
	.height( 200 )
	.dimension( typeDim )
	.title( function ( d ) {
		return d.key;
	} )
	.group( callsPerType );

var subTypeDim = ndx.dimension( dc.pluck( 'type' ) );
var callsPerSubType = remove_empty_bins( subTypeDim.group().reduceSum( dc.pluck( 'count' ) ) );
var subTypeNames = subTypeDim.top( Infinity ).map( function ( d ) { return d.subType; } );

var subTypeCall = dc.barChart( '#subtype' )
	.width( 900 )
	.height( 200 )
	.colors( d3.scale.category20b() )
	.dimension( subTypeDim )
	.group( callsPerSubType )
	.x( d3.scale.ordinal().domain( subTypeNames ) )
	.xUnits( dc.units.ordinal )
	.elasticX( true )
	.elasticY( true )
	.mouseZoomable( true )
	.ordering( function ( d ) {
		return -d.value;
	} )
	.yAxisLabel( "Number of calls" );

var dayHourDim = ndx.dimension( function ( d ) {
	return [ d.hour.toString(), d.day ];
} );
var callsPerDay = dayHourDim.group().reduceSum( dc.pluck( 'count' ) );

var dayhour = dc.heatMap( '#dayhour' )
	.width( 1200 )
	.height( 250 )
	.dimension( dayHourDim )
	.group( callsPerDay )
	.keyAccessor(function(d) { return +d.key[0]; })
	.valueAccessor(function(d) { return d.key[1]; })
	.colorCalculator(function(d) {
		var maxCalls = callsPerDay.top( 1 )[ 0 ].value;
		var calls = d.value;
		return "rgba( 206,43,28,"+ calls / maxCalls +")";
	} )
	.title( function ( d ) {
		return d.value.toString() + " calls";
	} );

dc.renderAll();*/

};

/*
var ndx = crossfilter( data );
var stateDim = ndx.dimension( dc.pluck( 'state' ) );
var fruitDim = ndx.dimension( dc.pluck( 'fruit' ) );
var freshDim = ndx.dimension( dc.pluck( 'fresh' ) );

var sale = stateDim.group().reduceSum( dc.pluck( 'qty' ) );
var salePerFresh = freshDim.group().reduceSum( dc.pluck( 'qty' ) );

var howManyFruits = fruitDim.group().reduceSum( dc.pluck( 'qty' ) );
print_filter( howManyFruits );

var p1 = dc.pieChart( "#piechart1" )
	.width( 200 )
	.height( 200 )
	.dimension( stateDim )
	.group( sale );

var p2 = dc.pieChart( "#piechart2" )
	.width( 200 )
	.height( 200 )
	.dimension( freshDim )
	.group( salePerFresh );

var bar = dc.barChart( "#bar" )
	.colors( d3.scale.category10() )
	.colorAccessor( function ( d ) {
		return d.key;
	} )
	.width( 600 )
	.height( 400 )
	.dimension( fruitDim )
	.group( howManyFruits )
	.elasticY( true )
	.x( d3.scale.ordinal().domain( fruits ) )
	.xUnits( dc.units.ordinal )
	.yAxisLabel( "Number of fruits sold" );

dc.renderAll();
*/
