# Game engine built with three.js that parses JSON files to set up scenes.
Expansion of game engine built with Three.js. Implements additional light sources and materials.

<h2 id="sprint-3-external-meshes-multiple-cameras-animation"><a name="user-content-sprint-3-external-meshes-multiple-cameras-animation" href="#sprint-3-external-meshes-multiple-cameras-animation" class="headeranchor-link" aria-hidden="true"><span class="headeranchor"></span></a>Sprint 3: External meshes, multiple cameras, animation</h2>
<h4 id="cs-4183-video-game-design-cs-4143-dr-david-cline"><a name="user-content-cs-4183-video-game-design-cs-4143-dr-david-cline" href="#cs-4183-video-game-design-cs-4143-dr-david-cline" class="headeranchor-link" aria-hidden="true"><span class="headeranchor"></span></a>CS 4183 : Video Game Design (CS 4143) <br/> Dr. David Cline</h4>
<p>In this sprint, you will add the capability to load external meshes to your scenes. Another important feature that you will add in this sprint is the ability to store and switch between multiple cameras.  You will also add some animation facilities to your engine by creating general animation scripts.</p>
<hr />
<h4 id="sprint-backlog-item-1-loading-external-meshes"><a name="user-content-sprint-backlog-item-1-loading-external-meshes" href="#sprint-backlog-item-1-loading-external-meshes" class="headeranchor-link" aria-hidden="true"><span class="headeranchor"></span></a>Sprint Backlog Item 1 - Loading external meshes</h4>
<ul>
<li>
<p>Extend your engine to load external meshes.  In particular, you should be able to load .obj files.</p>
</li>
<li>
<p>Make sure that your engine runs the example file related to the mesh loading, and that all of the material types are supported for externally loaded meshes.</p>
</li>
</ul>
<hr />
<h4 id="sprint-backlog-item-2-multiple-cameras"><a name="user-content-sprint-backlog-item-2-multiple-cameras" href="#sprint-backlog-item-2-multiple-cameras" class="headeranchor-link" aria-hidden="true"><span class="headeranchor"></span></a>Sprint Backlog Item 2 - Multiple cameras</h4>
<ul>
<li>Add the ability to load multiple cameras and switch between them at runtime using scripts. (In theory, you should already be able to load multiple cameras, just not switch between them.)</li>
</ul>
<hr />
<h4 id="sprint-backlog-item-3-animation-paths"><a name="user-content-sprint-backlog-item-3-animation-paths" href="#sprint-backlog-item-3-animation-paths" class="headeranchor-link" aria-hidden="true"><span class="headeranchor"></span></a>Sprint Backlog Item 3 - Animation paths</h4>
<ul>
<li>Add the ability to animate object properties using linear interpolation at least, and ideally Bezier curves or B-Splines.  You may use Tween.js if you wish.  Decide on your own representation and interpolation scheme. Make sure that you can specify this in the input file, as I will check this.</li>
</ul>
<hr />
<h4 id="sprint-backlog-item-4-new-scenes"><a name="user-content-sprint-backlog-item-4-new-scenes" href="#sprint-backlog-item-4-new-scenes" class="headeranchor-link" aria-hidden="true"><span class="headeranchor"></span></a>Sprint Backlog Item 4 - New Scenes</h4>
<ul>
<li>
<p>Make at least two new scenes that demonstrate the new capabilities of the engine, including loading meshes and switching between multiple cameras, and animating objects.</p>
</li>
<li>
<p>Make a scene that includes a car controller.  The car must be made of at least five different pieces (chassis and wheels).  Use a script to control the car so that the wheels turn properly when the car moves.</p>
</li>
</ul>
<hr />
<h4 id="sprint-backlog-item-5-web-deployment-and-handin"><a name="user-content-sprint-backlog-item-5-web-deployment-and-handin" href="#sprint-backlog-item-5-web-deployment-and-handin" class="headeranchor-link" aria-hidden="true"><span class="headeranchor"></span></a>Sprint Backlog Item 5 - Web Deployment and Handin</h4>
<ul>
<li>
<p>Deploy this sprint so that it works from a web server, such as CSX.</p>
</li>
<li>
<p>Demonstrate your scenes to the instructor, running from this web server.</p>
</li>
<li>
<p>Zip up your sprint files (code and scenes) into a single .zip file (not .rar!) and turn it in to D2L.</p>
</li>
</ul>
<hr />
<h4 id="grade-breakdown"><a name="user-content-grade-breakdown" href="#grade-breakdown" class="headeranchor-link" aria-hidden="true"><span class="headeranchor"></span></a>Grade Breakdown</h4>
<ul>
<li>
<p>External meshes: 20%</p>
</li>
<li>
<p>Switching between multiple cameras: 20%</p>
</li>
<li>
<p>Animation paths: 20%</p>
</li>
<li>
<p>Scenes demonstrating the new functionality: 30%</p>
</li>
<li>
<p>Deploying your solution so it is web accessible: 10%</p>
</li>
</ul>
<hr />
<h4 id="hints"><a name="user-content-hints" href="#hints" class="headeranchor-link" aria-hidden="true"><span class="headeranchor"></span></a>Hints</h4>
<ul>
<li>
<p>Have fun, and think creatively.</p>
</li>
<li>
<p>Start early!</p>
</li>
<li>
<p>Start with very simple scenes and build from there.  </p>
</li>
</ul></article></body></html>