angular.module('app', ['components'])

.controller('videoLibrary', function ($scope, $locale) {
    $scope.range = [0, 1, 2, 3, 4, 5, 6];
    $scope.testMessage = "this is a test message";

    $scope.encoded = [
        { id: 1, file: 'Inspection Video1.mts', asset: 'Popeye', size: 123, status: 'Encoding', progress: 0.5 },
        { id: 2, file: 'Inspection Video2.mts', asset: 'Brutus', size: 456, status: 'Encoding', progress: 0.8 },
        { id: 3, file: 'Inspection Video3.mts', asset: 'Olive', size: 789, status: 'Encoding', progress: 0.7 },
        { id: 4, file: 'Inspection Video4.mts', asset: 'Whimpy', size: 101112, status: 'Encoding', progress: 0.2 },
        { id: 5, file: 'Inspection Video5.mts', asset: 'Spongebob', size: 131415, status: 'Encoding', progress: 0.45 },
        { id: 6, file: 'Inspection Video6.mts', asset: 'Patric', size: 161718, status: 'Encoding', progress: 0.87 },
        { id: 7, file: 'Inspection Video7.mts', asset: 'Squid', size: 192021, status: 'Encoding', progress: 0.33 },
        { id: 8, file: 'Inspection Video8.mts', asset: 'Voltes5', size: 222324, status: 'Encoding', progress: 0.68 },
    ]

    if ($locale.id == 'en-us') {
        $scope.beerForms = {
            0: 'no beers',
            one: '{} beer',
            other: '{} beers'
        };
    } else {
        $scope.beerForms = {
            0: 'iadne pivo',
            one: '{} pivo',
            few: '{} pivá',
            other: '{} pív'
        };
    }

    $scope.itemId = (item) => {
        return 'enc_' + item.id;
    };
    $scope.itemProgress = (item) => {
        return item.progress * 100;
    };
});