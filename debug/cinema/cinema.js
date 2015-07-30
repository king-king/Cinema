library( function () {

    var css = imports( "css" ),
        filterOld = imports( "filter-old" ),
        filterBlur = imports( "filter-blur-stack" ),
        filterBlackAndWhite = imports( "filter-desaturate" ),
        filterBlend = imports( "filter-blend" ),
        filterSobel = imports( "filter-sobel" ),
        filterdull = imports( "filter-dull-polish" ),
        $ = imports( "element" ),
        Img = imports( "../../src/img" ),
        object = imports( "object" ),
        array = imports( "array" ),
        cssAnimation = imports( "css-animation" );

    var Scene = {
            "transverse-scale" : [
                {
                    0 : {
                        opacity : 0
                    },
                    30 : {
                        "-webkit-transform" : "translate3d(50%,0,0) scale(2)",
                        opacity : 1
                    },
                    80 : {
                        "-webkit-transform" : "translate3d(0,0,0) scale(2)",
                        opacity : 1
                    },
                    100 : {
                        "-webkit-transform" : "translate3d(0,0,0) scale(1)",
                        opacity : 0
                    }
                },
                4,
                0
            ],
            "opposite" : [
                {
                    0 : {
                        opacity : 0
                    },
                    15 : {
                        "-webkit-transform" : "translate3d(-20%,-40%,0) scale(2)",
                        opacity : 1
                    },
                    30 : {
                        "-webkit-transform" : "translate3d(-10%,-40%,0) scale(2.2)"
                    },
                    45 : {
                        "-webkit-transform" : "translate3d(50%,-40%,0) scale(2)"
                    },
                    60 : {
                        "-webkit-transform" : "translate3d(-20%,40%,0) scale(3)",
                        opacity : 1
                    },
                    100 : {
                        "-webkit-transform" : "translate3d(0,0,0) scale(1)",
                        opacity : 0
                    }
                },
                4,
                0
            ],
            "down-top" : [
                {
                    0 : {
                        opacity : 0
                    },
                    20 : {
                        "-webkit-transform" : "translate3d(0,-50%,0) scale(2)",
                        opacity : 1
                    },
                    80 : {
                        "-webkit-transform" : "translate3d(0,50%,0) scale(2)",
                        opacity : 1
                    },
                    100 : {
                        "-webkit-transform" : "translate3d(0,0,0) scale(1)",
                        opacity : 0
                    }
                },
                2,
                0
            ],
            "top-bottom-center" : [
                {
                    0 : {
                        opacity : 0
                    },
                    20 : {
                        "-webkit-transform" : "translate3d(0,50%,0) scale(2)",
                        opacity : 1
                    },
                    50 : {
                        "-webkit-transform" : "translate3d(0,-50%,0) scale(2)",
                        opacity : 1
                    },
                    80 : {
                        "-webkit-transform" : "translate3d(0,0,0) scale(2)",
                        opacity : 1
                    },
                    100 : {
                        "-webkit-transform" : "translate3d(0,0,0) scale(1)",
                        opacity : 0
                    }
                },
                4,
                0
            ]
        },
        Filter = {
            "black-white" : function ( pageData ) {
                return filterBlackAndWhite( pageData );
            },
            "older" : function ( pageData ) {
                return filterOld( pageData );
            },
            "blur" : function ( pageData ) {
                return filterBlur( pageData, 20 );
            },
            "flower" : function ( pageData1, pageData2 ) {
                return filterBlend( pageData1, pageData2, "Linear-Light" );
            },
            "hard" : function ( pageData1, pageData2 ) {
                return filterBlend( pageData1, pageData2, "Hard-Mix" );
            },
            "sobel" : function ( pageData ) {
                return filterSobel( pageData );
            },
            "filter-dull" : function ( pageData ) {
                return filterdull( pageData )
            }
        },
        additiveImgData;

    function getPageData( page, filter, callback ) {
        var gc = page.toCanvas().getContext( "2d" ),
            data1 = gc.getImageData( 0, 0, clientWidth, clientHeight );
        if ( filter == "flower" || filter == "hard" ) {
            additiveImgData ? callback( Filter[filter]( data1, additiveImgData ) ) : Img( "img/cinema-rainbow.jpg", {
                crossOrigin : true,
                onLoad : function ( img ) {
                    gc.drawImage( img, 0, 0, clientWidth, clientHeight );
                    additiveImgData = gc.getImageData( 0, 0, clientWidth, clientHeight );
                    callback( Filter[filter]( data1, additiveImgData ) );
                }
            } );
        }
        else {
            callback( Filter[filter]( data1 ) );
        }
    }

    function doCinema( page, scene, filter, callback ) {
        // scene可能是个字符串，也可能是个可以直接传给cssAnimation.animation的frames
        var canvas = page.toCanvas(),
            arg = {},
            style = cssAnimation.animation( object.is.String( scene ) ? Scene[scene] : scene, arg ),
            time = object.is.String( scene ) ? Scene[scene][1] * 1000 : scene[1] * 1000;
        css( canvas, {
            position : "absolute",
            top : "0",
            left : "0",
            "z-index" : 100,
            "-webkit-animation" : style,
            background : "white"
        } );
        body.appendChild( canvas );
        !filter ? setTimeout( function () {
            callback && callback();
            arg.handle.remove();
            $.remove( canvas );
        }, time ) : getPageData( page, filter, function ( data ) {
            canvas.getContext( "2d" ).putImageData( data, 0, 0 );
            setTimeout( function () {
                arg.handle.remove();
                $.remove( canvas );
                callback && callback();
            }, time );
        } );
        return {
            remove : function () {
                arg.handle.remove();
                $.remove( canvas );
            }
        }
    }

    // 生成一个可以传递给cssAnimation.animation的参数
    function constructAnimation( arg ) {
        function getDuration( arg ) {
            var duration = 0;
            object.foreach( arg, function ( key, value ) {
                duration += value.duration;
            } );
            return duration;
        }

        var frames = {},
            duration = getDuration( arg ),
            process = 0;
        array.foreach( arg, function ( value, i ) {
            var scale = value.scale || 1,
                x = value.x == "left" ? (scale - 1) / 2 * 100 + "%" : value.x == "right" ? -(scale - 1) / 2 * 100 + "%" : "0",
                y = value.y == "top" ? (scale - 1) / 2 * 100 + "%" : value.y == "bottom" ? -(scale - 1) / 2 * 100 + "%" : "0";
            process = i == arg.length - 1 ? 100 : process + value.duration / duration * 100;
            frames[process] = {
                opacity : value.opacity || 1,
                "-webkit-transform" : "translate3d(" + x + "," + y + ",0) scale(" + scale + ")"
            };
        } );
        return [frames, duration, 0];
    }

    exports.doCinema = doCinema;
    exports.constructAnimation = constructAnimation;
} );