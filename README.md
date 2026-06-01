# Please for the _Interns_

This is what the best way I could think of coming up with the app and ensuring the two environments (Angular and Nestjs) stay separate.

### medicore-app: This is the frontend <a href="https://angular.dev/overview">(Angular)</a>

### medicore-server: This is the backend <a href="https://docs.nestjs.com/">(Nestjs)</a>

## Local demo data

The Angular app can run with in-memory demo patients and appointments, so you can test the receptionist and patient flows without depending on live Firestore data.

- Demo mode is controlled by `useDemoData` in `medicore-app/src/environments/environment.ts`.
- `useDemoData: true` loads sample patients, appointments, and today's queue locally.
- `useDemoData: false` switches the app back to Firestore.
- Sample patient lookup phone numbers include `08031234567`, `08039876543`, `08123456780`, `08111112222`, and `07045556666`.

To get this repo into you VScode open the folder you want to put it into and do
`git init`

`git remote add origin <the repo URL>`

And yes thank God I remember before you start make any changes please 🙏🏽 create your own branch from the main before doing it you can do that with:

`git checkout -b <your name>`

If you need someone's code for example I need to get _David's_ code I look for his branch name and do:

`git checkout -b <your_branch>` <span style="color:green;">just to be sure you're in your branch</span>

`git pull origin <david's branch>` <span style="color:green">puttting his code into yours</span>

### Just in case you forgot how to push to your branch

`git add .`
`git commit -m "Please let it be a meaningful message for debugging purposes"`
`git push -u orign <your branch>`<span style="color:blue">If its a new branch</span>

### OR

`git push <your branch>` <span style="color:green>If its a new branch</span>

For merge conflicts I advice you to set up a meeting with who you have conflicts with to avoid removing or adding unneccesary things.

>[!IMPORTANT]
>
>Just in case you haven't caught up don't add angle brackets < or > to the command line when working.

>[!TIP]
>
>Not compulsory btw: I'll lwk advice you to get _GitLens_ extension from VScode it allows you to see who edited what and what day/time.

**Also Important:**
Don't push broken code it affects whoever is pulling your code if you have an issue and you need some help debugging dont push to your branch create a new branch from that branch push there and let someone else go to that branch for debugging.

**Example:**
`toyosi-branch` the branch with issue made a mistake the push there
`git checkout -b toyosi-branch-issues` <span style="color:green">its not by force to call it that</span>

Also try your best to comment on your code as much as possible its human beings that are going to be looking at your code please it doesn't have to be long just give little insight to what cetain blocks of code is doing.

That's all I can think of for now but as time passes I might add more to the README. file. Anyways thanks and don't erase or break our code we just have three weeks on this!!!

>[!IMPORTANT]
>Please if you have any issues you can contact Mr Babatunde or the other interns.
