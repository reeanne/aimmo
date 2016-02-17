import logging
import json

from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, redirect

from models import Avatar, Player
from simulation.avatar.avatar_wrapper import UserCodeException
from simulation.turn_manager import world_state_provider


# TODO: move all views that just render a template over to using django generic views

logger = logging.getLogger("views")

@login_required
def avatar(request):
    if request.method == 'POST':
        print "post"
        avatar = request.user.avatar_set.all()[0]
        appearance = json.loads(request.POST['appear'])
        avatar.body_stroke = appearance['bodyStroke']
        avatar.body_fill = appearance['bodyFill']
        avatar.eye_stroke = appearance['eyeStroke']
        avatar.eye_fill = appearance['eyeFill']
        avatar.save()
        return HttpResponse()
    else:
        if not request.user.avatar_set.all():
            avatar = Avatar.objects.create(player=request.user)
            avatar.save()
        print dict(colours=list(request.user.avatar_set.values('body_stroke', 'body_fill', 'eye_stroke', 'eye_fill')))
        return JsonResponse(dict(colours=list(request.user.avatar_set.values('body_stroke', 'body_fill', 'eye_stroke', 'eye_fill'))))


def register(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()

            with open("simulation/avatar_examples/dumb_avatar.py") as initial_code_file:
                initial_code = initial_code_file.read()

            Player(user=user, code=initial_code).save()
            authenticated_user = authenticate(username=form.cleaned_data['username'], password=form.cleaned_data['password1'])
            login(request, authenticated_user)
            return redirect('program')
    else:
        form = UserCreationForm()
    return render(request, 'accounts/register.html', {'form': form})


def _post_code_error_response(message):
    return HttpResponse("USER_ERROR\n\n" + message)


def _post_server_error_response(message):
    return HttpResponse("SERVER_ERROR\n\n" + message)


def _post_code_success_response(message):
    return HttpResponse("SUCCESS\n\n" + message)


@login_required
def code(request):
    if request.method == 'POST':
        request.user.player.code = request.POST['code']
        request.user.player.save()
        try:
            world = world_state_provider.lock_and_get_world()
            # TODO: deal with this in a better way
            if world is None:
                return _post_server_error_response('Your code was saved, but the game has not started yet!')

            world.player_changed_code(request.user.id, request.user.player.code)
        except UserCodeException as ex:
            return _post_code_error_response(ex.to_user_string())
        finally:
            world_state_provider.release_lock()
        
        return _post_code_success_response("Your code was saved!")
    else:
        return HttpResponse(request.user.player.code)
