$('#poke-default').hexed();

$('#poke-solid').hexed({
  borders: true,
  bordersColor: '#000',
  transparentify: false
});

$('#poke-solid-nopersp').hexed({
  perspective: false,
  borders: true,
  bordersColor: '#000',
  transparentify: false
});

$('#poke-solid-noborder').hexed({
  borders: false,
  transparentify: false
});

$('#poke-solid-noborder-nopersp').hexed({
  perspective: false,
  borders: false,
  transparentify: true,
  transitionTime: 1.0
});

$('.input-dial').hexed({
  currentChoiceModifiable: true,
  transparentify: false
});

$('.numbers-dial').hexed({
  perspective: false,
  transparentify: false,
  borders: true,
  bordersColor: '#FFF'
});

$('.poke-dial').on('selected', function(event, choice, choiceId) {
  console.log(choice + ' | ' + choiceId);
});
